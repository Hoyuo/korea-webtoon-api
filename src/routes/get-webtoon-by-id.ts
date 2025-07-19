import { Request, Response } from 'express';
import { AppDataSource } from '@/database/datasource';

/**
 * @swagger
 * /webtoons/{id}:
 *   get:
 *     tags: [Webtoons]
 *     summary: 웹툰 정보 조회
 *     description: 웹툰 ID를 사용하여 웹툰 정보를 조회합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 웹툰 ID
 *     responses:
 *       200:
 *         description: 웹툰 정보
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 provider:
 *                   type: string
 *                 updateDays:
 *                   type: array
 *                   items:
 *                     type: string
 *                 url:
 *                   type: string
 *                 thumbnail:
 *                   type: array
 *                   items:
 *                     type: string
 *                 isEnd:
 *                   type: boolean
 *                 isFree:
 *                   type: boolean
 *                 isUpdated:
 *                   type: boolean
 *                 ageGrade:
 *                   type: integer
 *                 freeWaitHour:
 *                   type: integer
 *                 authors:
 *                   type: array
 *                   items:
 *                     type: string
 *       404:
 *         description: 웹툰을 찾을 수 없습니다.
 *       500:
 *         description: 내부 서버 오류
 */
export const getWebtoonById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const webtoon = await AppDataSource.getRepository(
      'normalized_webtoon',
    ).findOneBy({ id: String(id) });

    if (!webtoon) {
      return res.status(404).json({ message: 'Webtoon not found' });
    }

    return res.json(webtoon);
  } catch (error) {
    console.error(`Error fetching webtoon with id ${req.params.id}:`, error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
