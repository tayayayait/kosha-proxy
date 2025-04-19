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

    // ✅ 유사도 점수 계산 및 라벨링
    const rankedDocuments = documents.map((doc) => {
      const score = Math.random(); // 🎯 실제 cosine similarity 로 대체 가능
      const similarityScore = parseFloat(score.toFixed(3));

      let relevanceLabel = '낮음';
      if (similarityScore >= 0.75) relevanceLabel = '높음';
      else if (similarityScore >= 0.5) relevanceLabel = '중간';

      return {
        doc_id: doc.doc_id || '',
        title: doc.title || '',
        similarityScore,
        legalPriorityLevel: doc.score || 0, // ⚠️ 원본 문서의 score 사용
        relevanceLabel
      };
    });

    // ✅ 필터링: similarity ≥ 0.70 AND 중요도 ≥ 3점
    const filteredDocuments = rankedDocuments.filter(doc => 
      doc.similarityScore >= 0.7 && doc.legalPriorityLevel >= 3
    );

    // ✅ 정렬
    filteredDocuments.sort((a, b) => 
      (b.similarityScore * 0.6 + b.legalPriorityLevel * 0.4) -
      (a.similarityScore * 0.6 + a.legalPriorityLevel * 0.4)
    );

    // ✅ 응답
    res.status(200).json({ rankedDocuments: filteredDocuments });

  } catch (error) {
    console.error('🔥 /api/similarity 오류:', error);
    res.status(500).json({ error: '서버 내부 오류', details: error.message });
  }
}
