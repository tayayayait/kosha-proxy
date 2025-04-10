export default async function handler(req, res) {
  const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
  const serviceKey = searchParams.get("serviceKey");
  const pageNo = searchParams.get("pageNo");
  const numOfRows = searchParams.get("numOfRows");
  const searchValue = searchParams.get("searchValue");
  const category = searchParams.get("category");

  const apiUrl = `http://apis.data.go.kr/B552468/srch/smartSearch?serviceKey=${serviceKey}&pageNo=${pageNo}&numOfRows=${numOfRows}&searchValue=${encodeURIComponent(searchValue)}&category=${category}`;

  const fetchRes = await fetch(apiUrl);
  const data = await fetchRes.json();

  res.status(200).json(data);
}
