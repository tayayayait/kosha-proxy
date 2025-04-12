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
      const errorText = await fetchRes.text(); // 텍스트 형태로 오류 확인
      throw new Error(`원본 API 호출 실패: ${fetchRes.status} - ${errorText}`);
    }

    const data = await fetchRes.json();

    // ✅ 법령 카테고리만 필터링 + 중요도 순 정렬 + 상위 20개만
    const lawCategories = ['1', '2', '3', '4', '5', '8', '9', '11'];
    if (data?.response?.body?.items?.item) {
      data.response.body.items.item = data.response.body.items.item
        .filter(item => lawCategories.includes(String(item.category))) // 숫자 대비용
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);
    }

    // ❌ 미디어자료는 제외
    if (data?.response?.body?.total_media) {
      delete data.response.body.total_media;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("🔥 API 처리 중 오류 발생:", error);
    res.status(500).json({ error: 'API 호출 실패', details: error.message });
  }
}
