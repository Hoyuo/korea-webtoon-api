import express from 'express';
import { AppDataSource } from './database/datasource';
import { putKakaoPage } from './routes/update/kakao-page';
import { putNaver } from './routes/update/naver';
import swaggerUi from 'swagger-ui-express';
import { specs } from './swagger';
import { putKakao } from './routes/update/kakao';
import { ROUTES } from './constants';
import { getHealthCheck } from './routes/health-check';
import { getWebtoons } from './routes/get-webtoons';
import { getWebtoonById } from './routes/get-webtoon-by-id';
import { getEpisodesByWebtoonId } from './routes/get-episodes-by-webtoon-id';
import cors from 'cors';

const app = express();

app.use(
  cors({
    origin: '*', // 모든 도메인 허용
    methods: ['GET', 'PUT'], // 허용할 HTTP 메소드
    credentials: true, // 쿠키를 포함한 요청 허용
    optionsSuccessStatus: 204, // 일부 브라우저에서 204 응답을 처리할 수 있도록 설정
  }),
);

const PORT = process.env.PORT || 3000;

(async () => {
  await AppDataSource.initialize();

  await AppDataSource.query('DROP VIEW IF EXISTS normalized_webtoon');

  await AppDataSource.query(`
    CREATE VIEW normalized_webtoon AS
    SELECT id, title, provider, updateDays, url, thumbnail, isEnd, isFree, isUpdated, ageGrade, freeWaitHour, authors FROM naver_webtoon
    UNION ALL
    SELECT id, title, provider, updateDays, url, thumbnail, isEnd, isFree, isUpdated, ageGrade, freeWaitHour, authors FROM kakao_webtoon
    UNION ALL
    SELECT id, title, provider, updateDays, url, thumbnail, isEnd, isFree, isUpdated, ageGrade, freeWaitHour, authors FROM kakao_page_webtoon;
  `);

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  app.use(ROUTES.SWAGGER, swaggerUi.serve, swaggerUi.setup(specs));

  app.put(ROUTES.UPDATE_NAVER, putNaver);

  app.put(ROUTES.UPDATE_KAKAO, putKakao);

  app.put(ROUTES.UPDATE_KAKAO_PAGE, putKakaoPage);

  app.get(ROUTES.HEALTH_CHECK, getHealthCheck);

  app.get(ROUTES.GET_WEBTOONS, getWebtoons);

  app.get(ROUTES.GET_WEBTOON_BY_ID, getWebtoonById);

  app.get(ROUTES.GET_EPISODES_BY_WEBTOON_ID, getEpisodesByWebtoonId);

  app.get('/', (_, res) => res.redirect(ROUTES.SWAGGER));
})();
