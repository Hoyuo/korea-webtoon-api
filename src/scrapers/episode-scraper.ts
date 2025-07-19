import puppeteer, { Browser } from 'puppeteer';

interface Episode {
  title: string;
  thumbnail: string;
  url: string;
  uploadDate: string;
  waitForFree?: boolean;
}

const scrapeNaverEpisodes = async (url: string): Promise<Episode[]> => {
  let browser: Browser | null = null;
  try {
    browser = await puppeteer.launch({
      headless: true, // 백그라운드에서 실행
      executablePath: '/usr/bin/google-chrome-stable',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // 봇 감지를 피하기 위해 실제 브라우저처럼 보이도록 User-Agent 설정
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    );

    await page.goto(url, { waitUntil: 'networkidle0' });
    const episodeListSelector =
      'ul[class*="EpisodeListList__episode_list"] > li[class*="EpisodeListList__item"]';
    await page.waitForSelector(episodeListSelector);

    const episodes = await page.evaluate((selector) => {
      const episodeList: Episode[] = [];
      document.querySelectorAll(selector).forEach((element) => {
        // 각 요소의 선택자도 새로운 클래스 이름에 맞게 수정합니다.
        const titleElement = element.querySelector(
          'span[class*="EpisodeListList__title"]',
        );
        const imgElement = element.querySelector<HTMLImageElement>('img');
        const urlElement = element.querySelector('a');
        const dateElement = element.querySelector('span.date');

        if (titleElement && imgElement && urlElement && dateElement) {
          episodeList.push({
            title: titleElement.textContent?.trim() || '',
            thumbnail: imgElement.src || '',
            url: urlElement.href, // page.evaluate에서 href는 자동으로 절대 경로로 변환됩니다.
            uploadDate: dateElement.textContent?.trim() || '',
          });
        }
      });
      return episodeList;
    }, episodeListSelector);

    return episodes;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

const scrapeKakaoEpisodes = async (url: string): Promise<Episode[]> => {
  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch({
      headless: true, // 백그라운드에서 실행
      executablePath: '/usr/bin/google-chrome-stable',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // 봇 감지를 피하기 위해 실제 브라우저처럼 보이도록 User-Agent 설정
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    );

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    const episodeItemSelector = 'li[data-index]';
    await page.waitForSelector(episodeItemSelector, { timeout: 60000 });

    const episodes = await page.evaluate((selector) => {
      const episodeList: Episode[] = [];
      const items = document.querySelectorAll(selector);

      items.forEach(element => {
        // 내부 선택자는 아직 클래스에 의존하지만, 이 역시 더 안정적인 구조적 관계로 변경할 수 있습니다.
        const title = (element.querySelector('p.s12-regular-white') as HTMLElement)?.innerText || '';
        const thumbnail = (element.querySelector('picture img') as HTMLImageElement)?.src || '';
        const uploadDate = (element.querySelector('p.s11-regular-white') as HTMLElement)?.innerText || '';
        const waitForFree = element.querySelector('img[alt="기다무"]') !== null;
        const url = (element.querySelector('a') as HTMLAnchorElement)?.href || '';

        if (title && thumbnail) {
          episodeList.push({
            title,
            thumbnail,
            url,
            uploadDate,
            waitForFree,
          });
        }
      });
      return episodeList;
    }, episodeItemSelector); // evaluate 함수에 선택자를 인자로 전달

    return episodes;
  } catch (error) {
    console.error('스크래핑 중 오류가 발생했습니다:', error);
    return []; // 오류 발생 시 빈 배열 반환
  } finally {
    // 5. 브라우저 종료
    if (browser) {
      await browser.close();
    }
  }
};

export const scrapeWebtoonEpisodes = async (
  url: string,
  provider: string,
): Promise<Episode[]> => {
  try {
    let episodes: Episode[] = [];

    switch (provider.toUpperCase()) {
      case 'NAVER':
        episodes = await scrapeNaverEpisodes(url);
        break;
      case 'KAKAO':
        episodes = await scrapeKakaoEpisodes(url);
        break;
      // TODO: KAKAO_PAGE 로직 추가
      default:
        break;
    }
    return episodes;
  } catch (error) {
    console.error(`Error scraping episodes from ${url}:`, error);
    return [];
  }
};
