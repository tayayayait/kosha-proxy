export default async function handler(req, res) {
  const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
  const serviceKey = searchParams.get("serviceKey");
  const pageNo = searchParams.get("pageNo");
  const numOfRows = searchParams.get("numOfRows");
  const searchValue = searchParams.get("searchValue");
  const category = searchParams.get("category");

  const apiUrl = `http://apis.data.go.kr/B552468/srch/smartSearch?serviceKey=${serviceKey}&pageNo=${pageNo}&numOfRows=${numOfRows}&searchValue=${encodeURIComponent(searchValue)}&category=${category}`;

  try {
    const fetchRes = await fetch(apiUrl);
    const data = await fetchRes.json();

    // ✅ 응답 경량화: 필요한 일부만 추출
    if (data?.response?.body?.total_media) {
      data.response.body.total_media = data.response.body.total_media.slice(0, 1);
    }
    if (data?.response?.body?.items?.item) {
      data.response.body.items.item = data.response.body.items.item.slice(0, 1);
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'API 호출 실패', details: error.message });
  }
}

