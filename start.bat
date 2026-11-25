@echo off
echo ========================================================
echo   CivicLens AI - harshith.embarko.app
echo   See the problem. Understand it. Fix it.
echo ========================================================
echo.

set PROJECT_ROOT=%~dp0
echo [1/2] Starting Spring Boot API on port 8080...
start "CivicLens AI Backend" cmd /k "cd /d %PROJECT_ROOT%backend && mvn -s settings.xml spring-boot:run"

echo [2/2] Starting React Frontend on port 5173...
start "CivicLens AI Frontend" cmd /k "cd /d %PROJECT_ROOT%frontend && npm run dev"

echo.
echo ========================================================
echo Application launching!
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:8080/api
echo Swagger/Health: http://localhost:8080/api/reports/stats
echo.
echo Demo Accounts:
echo   - Citizen User: user@civiclens.app / demo123
echo   - Admin Panel:  admin@civiclens.app / admin123
echo ========================================================
pause
