/**
 * AI4S&T 연구센터 — 참여기관 담당자 등록 시스템
 * Google Apps Script (Google Sheets 연동용)
 *
 * 사용 방법:
 *   1) Google Sheets 새 스프레드시트 생성
 *   2) 1행에 다음 헤더 입력 (정확히 11개 컬럼)
 *      A1: 등록일시
 *      B1: 기관구분
 *      C1: 기관명
 *      D1: 부서
 *      E1: 역할
 *      F1: 이름
 *      G1: 직책
 *      H1: 휴대폰
 *      I1: 이메일
 *      J1: AI전문가여부
 *      K1: 비고
 *   3) 확장 프로그램 → Apps Script 열기
 *   4) 이 파일 전체를 붙여넣기
 *   5) 저장 → 배포 → 새 배포 → 유형: 웹 앱
 *      - 액세스 권한: "모든 사용자" 선택 (익명 등록 허용)
 *      - 다음 사용자 자격: "나" 선택
 *   6) 배포 URL 복사 → index.html 의 SCRIPT_URL 변수에 붙여넣기
 */

const SHEET_NAME = '담당자등록';  // 시트 이름 (탭 이름과 일치)

// ========== POST: 신규 등록 ==========
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getSheet_();

    sheet.appendRow([
      data.timestamp || new Date().toLocaleString('ko-KR'),
      data.orgType || '',
      data.orgName || '',
      data.department || '',
      data.role || '',
      data.personName || '',
      data.position || '',
      data.phone || '',
      data.email || '',
      data.aiExpert || 'N',
      data.note || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ========== GET: 등록 목록 조회 ==========
function doGet(e) {
  try {
    const sheet = getSheet_();
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) {
      return jsonOut_([]);
    }

    const rows = values.slice(1).map(r => ({
      timestamp:  r[0],
      orgType:    r[1],
      orgName:    r[2],
      department: r[3],
      role:       r[4],
      personName: r[5],
      position:   r[6],
      phone:      r[7],
      email:      r[8],
      aiExpert:   r[9],
      note:       r[10]
    })).filter(r => r.orgName);  // 빈 행 제외

    return jsonOut_(rows);
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  }
}

// ========== 헬퍼 ==========
function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      '등록일시', '기관구분', '기관명', '부서', '역할',
      '이름', '직책', '휴대폰', '이메일', 'AI전문가여부', '비고'
    ]);
    sheet.getRange(1, 1, 1, 11)
      .setFontWeight('bold')
      .setBackground('#1F4E79')
      .setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
