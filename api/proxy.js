// 파일: api/external/proxy.js

const LAW_CATEGORIES = ['1', '2', '3', '4', '5', '8', '9', '11'];

async function fetchWithRetry(url, retries = 3) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res;
  } catch (error) {
    if (retries > 0) {
      console.warn(`Retrying fetch... 남은 재시도 횟수: ${retries}`);
      return await fetchWithRetry(url, retries - 1);
    } else {
      throw new Error('모든 재시도 실패: ' + error.message);
    }
  }
}

function processItems(items, isCategory3) {
  if (isCategory3) {
    return items
      .filter(item => item.title.match(/^제\d+조/) && !item.title.includes("서식"))
      .map(item => ({
        doc_id: item.doc_id,
        title: item.title,
        highlight_content: item.highlight_content?.split('\n')[0] || '',
        score: item.score,
        legalHit: item.legalHit,
        keyword: item.keyword,
        category: item.category
      }));
  } else {
    return items
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  }
}

export default async function handler(req, res) {
  try {
    const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
    const serviceKey = searchParams.get("serviceKey");
    const pageNo = searchParams.get("pageNo");
    const numOfRows = searchParams.get("numOfRows");
    const searchValue = searchParams.get("searchValue");
    const category = searchParams.get("category");

    if (!serviceKey || !pageNo || !numOfRows || !searchValue || !category) {
      return res.status(400).json({ error: '필수 파라미터가 누락되었습니다.' });
    }

    const apiUrl = `http://apis.data.go.kr/B552468/srch/smartSearch?serviceKey=${serviceKey}&pageNo=${pageNo}&numOfRows=${numOfRows}&searchValue=${encodeURIComponent(searchValue)}&category=${category}`;

    const fetchRes = await fetchWithRetry(apiUrl);
    const data = await fetchRes.json();

    const isCategory3 = category === '3';

    if (data?.response?.body?.items?.item) {
      let items = data.response.body.items.item;
      items = items.filter(item => LAW_CATEGORIES.includes(String(item.category)));
      items = processItems(items, isCategory3);
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
