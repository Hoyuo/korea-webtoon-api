import { Request, Response } from 'express';
import { AppDataSource } from '@/database/datasource';
import { scrapeWebtoonEpisodes } from '@/scrapers/episode-scraper';

/**
 * @swagger
 * /webtoons/{id}/episodes:
 *   get:
 *     tags: [Webtoons]
 *     summary: 웹툰 에피소드 목록 조회
 *     description: 웹툰 ID를 사용하여 에피소드 목록을 조회합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 웹툰 ID
 *     responses:
 *       200:
 *         description: 에피소드 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                       url:
 *                         type: string
 *                       thumbnail:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                 total:
 *                   type: integer
 *       404:
 *         description: 웹툰을 찾을 수 없습니다.
 *       500:
 *         description: 내부 서버 오류
 */
export const getEpisodesByWebtoonId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 데이터베이스에서 웹툰 정보를 찾아 URL과 제공사를 확인합니다.
    const webtoon = await AppDataSource
      .getRepository('normalized_webtoon')
      .findOneBy({ id: String(id) });

    if (!webtoon) {
      return res.status(404).json({ message: 'Webtoon not found' });
    }

    // 스크래퍼를 호출하여 에피소드 목록을 가져옵니다.
    const episodes = await scrapeWebtoonEpisodes(String(webtoon.url), webtoon.provider);

    return res.json({
      items: episodes,
      total: episodes.length,
    });
  } catch (error) {
    console.error(`Error fetching episodes for webtoon id ${req.params.id}:`, error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};