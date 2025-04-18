export default async function handler(req, res) {
  try {
    const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
    const serviceKey = searchParams.get("serviceKey");
    const pageNo = searchParams.get("pageNo");
    const numOfRows = searchParams.get("numOfRows");
    const searchValue = searchParams.get("searchValue");
    const category = searchParams.get("category");

    const apiUrl = `http://apis.data.go.kr/B552468/srch/smartSearch?serviceKey=${serviceKey}&pageNo=${pageNo}&numOfRows=${numOfRows}&searchValue=${encodeURIComponent(searchValue)}&category=${category}`;

    const fetchRes = await fetch(apiUrl);
    
    if (!fetchRes.ok) {
      const errorText = await fetchRes.text();
      throw new Error(`원본 API 호출 실패: ${fetchRes.status} - ${errorText}`);
    }

    const data = await fetchRes.json();

    // ✅ 카테고리3 전용 처리 로직
    const isCategory3 = category === '3';

    if (data?.response?.body?.items?.item) {
      let items = data.response.body.items.item;

      // ✅ 공통: 법령 카테고리 필터링
      const lawCategories = ['1', '2', '3', '4', '5', '8', '9', '11'];
      items = items.filter(item => lawCategories.includes(String(item.category)));

      if (isCategory3) {
        // ✅ 조문 제목 + 요약 필터 적용 (서식 제거 + 제목만)
        items = items
          .filter(item =>
            item.title.match(/^제\d+조/) && // '제XX조' 형태만
            !item.title.includes("서식") &&
            !item.title.includes("별표")
          )
          .map(item => ({
            doc_id: item.doc_id,
            title: item.title,
            highlight_content: item.highlight_content?.split('\n')[0] || '', // 1줄 요약
            score: item.score,
            legalHit: item.legalHit,
            keyword: item.keyword,
            category: item.category
          }));
      } else {
        // ✅ 기타 카테고리는 기존 방식 유지 (중요도 순 상위 20개)
        items = items.sort((a, b) => b.score - a.score).slice(0, 20);
      }

      data.response.body.items.item = items;
    }

    // ❌ 미디어자료 제거
    if (data?.response?.body?.total_media) {
      delete data.response.body.total_media;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("🔥 API 처리 중 오류 발생:", error);
    res.status(500).json({ error: 'API 호출 실패', details: error.message });
  }
}
