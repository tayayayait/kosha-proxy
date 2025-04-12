export default async function handler(req, res) {
const searchValue = searchParams.get("searchValue");
const pageNo = searchParams.get("pageNo") || "1";
const numOfRows = searchParams.get("numOfRows") || "5";
const category = searchParams.get("category");
const lightMode = searchParams.get("lightMode") || "true";

if (!searchValue || searchValue.length < 2) {
  return res.status(400).json({ error: '검색어를 구체적으로 입력해주세요.' });
}

const apiUrl = `https://apis.data.go.kr/B552468/srch/smartSearch?serviceKey=${serviceKey}&pageNo=${pageNo}&numOfRows=${numOfRows}&searchValue=${encodeURIComponent(searchValue)}&category=${category}&lightMode=${lightMode}`;

  try {
    const fetchRes = await fetch(apiUrl);
    const data = await fetchRes.json();

    // ✅ 법령 카테고리만 필터링 + 중요도 순 정렬 + 상위 10개만
    const lawCategories = ['1', '2', '3', '4', '5', '8', '9', '11'];
    if (data?.response?.body?.items?.item) {
      data.response.body.items.item = data.response.body.items.item
        .filter(item => lawCategories.includes(item.category))
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);
    }

    // ❌ 미디어자료는 제외
    if (data?.response?.body?.total_media) {
      delete data.response.body.total_media;
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'API 호출 실패', details: error.message });
  }
}

