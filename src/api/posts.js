// src/api/posts.js
import axios from 'axios';

// HOT TOP5 가져오기
export const fetchHotTop5Api = async () => {
  const res = await axios.get('/api/posts/top-scraps');
  return res.data.body.data.map((post, idx) => ({
    id: post.postId,
    title: post.productName,
    agency: post.companyName,
    period: post.deadline ?? '기간 미정', // null 방어 처리
    category: post.postType === 'LOAN' ? '대출' : '공공지원금',
    categoryClass: post.postType === 'LOAN' ? 'loan' : 'public',
    rank: idx + 1,
  }));
};
