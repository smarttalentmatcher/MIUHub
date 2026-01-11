const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// JSON 파싱 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공
app.use(express.static(__dirname));

// Supabase 설정
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://waumfxamhuvhsblehsuf.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // Service Role Key 필요

// 환경 변수 디버깅 (Railway에서 확인용)
console.log('=== Supabase 환경 변수 확인 ===');
console.log('SUPABASE_URL:', SUPABASE_URL ? '설정됨' : '미설정');
console.log('SUPABASE_SERVICE_KEY:', SUPABASE_SERVICE_KEY ? `설정됨 (길이: ${SUPABASE_SERVICE_KEY.length})` : '미설정');
console.log('===========================');

let supabaseAdmin = null;
if (SUPABASE_SERVICE_KEY) {
    try {
        supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
        console.log('✅ Supabase Admin 클라이언트 초기화 성공');
    } catch (error) {
        console.error('❌ Supabase Admin 클라이언트 초기화 실패:', error);
    }
} else {
    console.error('❌ SUPABASE_SERVICE_KEY가 설정되지 않았습니다.');
}

// privacy-policy.html
app.get('/privacy-policy.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'privacy-policy.html'));
});

// privacy-policy (확장자 없이)
app.get('/privacy-policy', (req, res) => {
    res.sendFile(path.join(__dirname, 'privacy-policy.html'));
});

// terms-of-service.html
app.get('/terms-of-service.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'terms-of-service.html'));
});

// terms-of-service (확장자 없이)
app.get('/terms-of-service', (req, res) => {
    res.sendFile(path.join(__dirname, 'terms-of-service.html'));
});

// reset-password.html
app.get('/reset-password.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'reset-password.html'));
});

// reset-password (확장자 없이)
app.get('/reset-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'reset-password.html'));
});

// App Config 조회 API (Supabase app_config 테이블에서 색상 값 조회)
app.get('/api/config', async (req, res) => {
    try {
        if (supabaseAdmin) {
            try {
                // app_config 테이블에서 모든 설정 가져오기
                const { data, error } = await supabaseAdmin
                    .from('app_config')
                    .select('key, value');
                
                if (error) {
                    throw error;
                }
                
                if (data && data.length > 0) {
                    // config 객체 생성
                    const config = {};
                    data.forEach(row => {
                        config[row.key] = row.value;
                    });
                    
                    return res.json({
                        success: true,
                        config: config
                    });
                }
            } catch (supabaseError) {
                console.error('Supabase config 조회 오류:', supabaseError);
                // 에러가 발생해도 빈 config 반환 (서버가 계속 작동하도록)
            }
        }
        
        return res.json({
            success: true,
            config: {}
        });
    } catch (error) {
        console.error('Config 조회 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.', message: error.message });
    }
});

// 비밀번호 재설정 API (Supabase Admin API 사용)
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        // 요청 로깅
        console.log('=== 비밀번호 재설정 API 호출 ===');
        console.log('요청 시간:', new Date().toISOString());
        console.log('환경 변수 상태:');
        console.log('  - SUPABASE_URL:', SUPABASE_URL || '미설정');
        console.log('  - SUPABASE_SERVICE_KEY:', SUPABASE_SERVICE_KEY ? `설정됨 (길이: ${SUPABASE_SERVICE_KEY.length}, 시작: ${SUPABASE_SERVICE_KEY.substring(0, 20)}...)` : '미설정');
        console.log('  - supabaseAdmin:', supabaseAdmin ? '초기화됨' : '초기화 안됨');
        console.log('  - process.env.SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? `존재 (길이: ${process.env.SUPABASE_SERVICE_KEY.length})` : '없음');
        
        const { email, newPassword } = req.body;
        
        if (!email || !newPassword) {
            return res.status(400).json({ error: '이메일과 새 비밀번호를 입력해주세요.' });
        }
        
        // 새 비밀번호 정책 검증
        if (newPassword.length < 8) {
            return res.status(400).json({ error: '비밀번호는 최소 8자 이상이어야 합니다.' });
        }
        
        if (!/(?=.*[A-Z])/.test(newPassword)) {
            return res.status(400).json({ error: '비밀번호는 대문자를 포함해야 합니다.' });
        }
        
        if (!/(?=.*[a-z])/.test(newPassword)) {
            return res.status(400).json({ error: '비밀번호는 소문자를 포함해야 합니다.' });
        }
        
        if (!/(?=.*[0-9])/.test(newPassword)) {
            return res.status(400).json({ error: '비밀번호는 숫자를 포함해야 합니다.' });
        }
        
        if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(newPassword)) {
            return res.status(400).json({ error: '비밀번호는 특수문자를 포함해야 합니다.' });
        }
        
        if (!supabaseAdmin) {
            console.error('❌ Supabase Admin 클라이언트가 초기화되지 않았습니다.');
            console.error('SUPABASE_URL:', SUPABASE_URL);
            console.error('SUPABASE_SERVICE_KEY 존재 여부:', !!SUPABASE_SERVICE_KEY);
            console.error('현재 환경 변수:', {
                SUPABASE_URL: SUPABASE_URL ? '설정됨' : '미설정',
                SUPABASE_SERVICE_KEY: SUPABASE_SERVICE_KEY ? '설정됨' : '미설정'
            });
            return res.status(500).json({ error: 'Supabase가 설정되지 않았습니다. Railway Variables에서 SUPABASE_SERVICE_KEY 환경 변수를 확인해주세요.' });
        }
        
        // 이메일로 사용자 찾기
        const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (listError) {
            console.error('사용자 목록 조회 실패:', listError);
            return res.status(500).json({ error: '사용자를 찾는 중 오류가 발생했습니다.' });
        }
        
        const user = users.users.find(u => u.email === email);
        
        if (!user) {
            return res.status(404).json({ error: '해당 이메일의 사용자를 찾을 수 없습니다.' });
        }
        
        // Supabase Admin API로 비밀번호 업데이트
        const { data, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { password: newPassword }
        );
        
        if (updateError) {
            console.error('비밀번호 업데이트 실패:', updateError);
            return res.status(500).json({ error: '비밀번호 변경에 실패했습니다.' });
        }
        
        res.json({
            success: true,
            message: '비밀번호가 변경되었습니다.'
        });
        
    } catch (error) {
        console.error('비밀번호 재설정 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 루트 경로는 privacy-policy로
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'privacy-policy.html'));
});

// 서버 시작
app.listen(PORT, '0.0.0.0', () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log('=== 서버 시작 시 환경 변수 확인 ===');
    console.log('SUPABASE_URL:', SUPABASE_URL || '미설정');
    console.log('SUPABASE_SERVICE_KEY:', SUPABASE_SERVICE_KEY ? `설정됨 (길이: ${SUPABASE_SERVICE_KEY.length})` : '미설정');
    console.log('supabaseAdmin 초기화:', supabaseAdmin ? '성공' : '실패');
    console.log('================================');
});




