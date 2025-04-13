export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed. Use POST only.' });
  }

  try {
    const { accidentText, documents } = req.body;

    // ✅ 요청 유효성 검사
    if (typeof accidentText !== 'string' || accidentText.trim().length === 0) {
      return res.status(400).json({ error: "'accidentText'는 비어있을 수 없습니다." });
    }

    if (!Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ error: "'documents'는 최소 1개 이상의 문서가 포함된 배열이어야 합니다." });
    }

    // ✅ 샘플 유사도 점수 부여 및 라벨링 (실제 유사도 계산 로직으로 교체 가능)
    const rankedDocuments = documents.map((doc) => {
      const score = Math.random(); // 🎯 실제는 cosine similarity 등으로 대체
      const similarityScore = parseFloat(score.toFixed(3));

      let relevanceLabel = '낮음';
      if (similarityScore >= 0.75) relevanceLabel = '높음';
      else if (similarityScore >= 0.5) relevanceLabel = '중간';

      return {
        doc_id: doc.doc_id || '',
        title: doc.title || '',
        similarityScore,
        relevanceLabel
      };
    });

    // ✅ 점수 기준 정렬
    rankedDocuments.sort((a, b) => b.similarityScore - a.similarityScore);

    // ✅ 응답 반환
    res.status(200).json({ rankedDocuments });

  } catch (error) {
    console.error('🔥 /api/similarity 오류:', error);
    res.status(500).json({ error: '서버 내부 오류', details: error.message });
  }
}

