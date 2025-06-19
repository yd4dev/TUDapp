// RSS feeds configuration for the app
// Each feed can have language-specific URLs, a default URL, a name, and an image (icon URL)

export type FeedConfig = {
  id: string; // unique identifier
  name: { [lang: string]: string; default: string };
  urls: { [lang: string]: string; default: string };
  image?: string; // optional icon URL for custom image
};

export const FEEDS: FeedConfig[] = [
  {
    id: 'd120',
    name: { de: 'D120', en: 'D120', default: 'D120' },
    urls: {
      de: 'https://www.d120.de/rss/feed.de.rss',
      en: 'https://www.d120.de/rss/feed.en.rss',
      default: 'https://www.d120.de/rss/feed.de.rss',
    },
    image: 'https://www.d120.de/images/aktuelles/neuigkeiten.webp'
  },
  {
    id: 'fb20',
    name: { de: 'FB20', en: 'FB20', default: 'FB20' },
    urls: {
      de: 'https://www.informatik.tu-darmstadt.de/fb20/aktuelles_fb20/fb20_neuigkeiten/news_rss_feed.de.rss',
      en: 'https://www.informatik.tu-darmstadt.de/fb20/aktuelles_fb20/fb20_neuigkeiten/news_rss_feed.en.rss',
      default: 'https://www.informatik.tu-darmstadt.de/fb20/aktuelles_fb20/fb20_neuigkeiten/news_rss_feed.de.rss',
    },
    image: 'https://www.informatik.tu-darmstadt.de/media/informatik/fb20_allgemeines/fb20_logos_1/fb20_fachbereichinformatik/favicon.png',
  },
  {
    id: 'tu-darmstadt',
    name: { de: 'News für Studierende', en: 'News for Students', default: 'News for Students' },
    urls: {
      de: 'https://www.tu-darmstadt.de/studieren/studierende_tu/news_fuer_studierende/rss_studierenden_news.de.rss',
      en: 'https://www.tu-darmstadt.de/studieren/studierende_tu/news_fuer_studierende/rss_studierenden_news.en.rss',
      default: 'https://www.tu-darmstadt.de/studieren/studierende_tu/news_fuer_studierende/rss_studierenden_news.de.rss',
    },
    image: 'https://www.tu-darmstadt.de/media/dezernat_ii/tucan/cn_med_logos/cn_med_logos_standard/tucanlogo-500x500.png',
  },
  {
    id: 'ulb',
    name: { de: 'ULB News', en: 'ULB News', default: 'ULB News' },
    urls: {
      de: 'https://www.ulb.tu-darmstadt.de/die_bibliothek/aktuelles/news/news_rss_feed.de.rss',
      en: 'https://www.ulb.tu-darmstadt.de/die_bibliothek/aktuelles/news/news_rss_feed.en.rss',
      default: 'https://www.ulb.tu-darmstadt.de/die_bibliothek/aktuelles/news/news_rss_feed.de.rss',
    },
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCKP39tgtzsoPXvSD3L5IC8aRJF3Y3oDjN0y322YVHhyZCwfJMUHEn5Mva08omtXolgdQ&usqp=CAU',
  },
  {
    id: 'rmv',
    name: { de: 'RMV Darmstadt', en: 'RMV Darmstadt', default: 'RMV Darmstadt' },
    urls: {
      de: 'https://www.rmv.de/auskunft/bin/jp/help.exe/dnl?tpl=rss_feed&region=1',
      en: 'https://www.rmv.de/auskunft/bin/jp/help.exe/dnl?tpl=rss_feed&region=1',
      default: 'https://www.rmv.de/auskunft/bin/jp/help.exe/dnl?tpl=rss_feed&region=1',
    },
    image: 'https://www.rmv.de/favicon.ico',
  },
  {
    id: 'hda',
    name: { de: 'Hochschuldidaktische Arbeitsstelle', en: 'Hochschuldidaktische Arbeitsstelle', default: 'Hochschuldidaktische Arbeitsstelle' },
    urls: {
      de: 'https://www.hda.tu-darmstadt.de/start_hda/aktuelles_hda/news_hda_rss_feed.de.rss',
      en: 'https://www.hda.tu-darmstadt.de/start_hda/aktuelles_hda/news_hda_rss_feed.en.rss',
      default: 'https://www.hda.tu-darmstadt.de/start_hda/aktuelles_hda/news_hda_rss_feed.de.rss',
    },
    image: 'https://www.hda.tu-darmstadt.de/media/hda/zentrale_hda_medien/2013-10-hda-logo_1024px.png',
  },
  {
    id: 'asta',
    name: { de: 'ASTA', en: 'ASTA', default: 'ASTA' },
    urls: {
      de: 'https://www.asta.tu-darmstadt.de/de/rss.xml',
      en: 'https://www.asta.tu-darmstadt.de/en/rss.xml',
      default: 'https://www.asta.tu-darmstadt.de/de/rss.xml',
    },
    image: 'https://www.asta.tu-darmstadt.de/sites/all/themes/asta_2015/favicon.ico',
  },
  {
    id: 'hrz',
    name: { de: 'HRZ', en: 'HRZ', default: 'HRZ' },
    urls: {
      de: 'https://www.hrz.tu-darmstadt.de/hrz_aktuelles/hrz_news/news_rss_feed.de.rss',
      en: 'https://www.hrz.tu-darmstadt.de/hrz_aktuelles/hrz_news/news_rss_feed.en.rss',
      default: 'https://www.hrz.tu-darmstadt.de/hrz_aktuelles/hrz_news/news_rss_feed.de.rss',
    },
    image: 'https://www.hrz.tu-darmstadt.de/media/hrz/responsive_design/hrz_logo_1/HRZ-Logo_Neu.png',
  },
];