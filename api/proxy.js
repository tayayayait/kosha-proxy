// File: api/proxy.js

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

    if (data?.response?.body?.items?.item) {
      let items = data.response.body.items.item;

      const lawCategories = ['1', '2', '3', '4', '5', '8', '9', '11'];
      items = items.filter(item => lawCategories.includes(String(item.category)));

      // ✅ 카테고리 상관없이 중요도 순 상위 20개만 남김
      items = items.sort((a, b) => b.score - a.score).slice(0, 20);

      data.response.body.items.item = items;
    }

    if (data?.response?.body?.total_media) {
      delete data.response.body.total_media;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("🔥 API 처리 중 오류 발생:", error);
    res.status(500).json({ error: 'API 호출 실패', details: error.message });
  }
}
