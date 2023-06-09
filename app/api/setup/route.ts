import { NextResponse } from 'next/server';
import { PineconeClient } from '@pinecone-database/pinecone';
import { PuppeteerWebBaseLoader } from 'langchain/document_loaders/web/puppeteer';
import {
  createPineconeIndex,
  updatePinecone
} from '../../../utils';
import { indexName } from '../../../config';

export async function POST() {
  // Array of URLs to scrape data from
  const urls = [
  "https://nucleus.internal.cubase.org/web-services/2016/12/06/rateboard-current-date/",
  "https://nucleus.internal.cubase.org/web-services/2016/12/09/redesign-project-start-to-finish/",
  "https://nucleus.internal.cubase.org/web-services/2013/12/02/web-services-super-email/",
  "https://nucleus.internal.cubase.org/web-services/2014/01/03/obc-customization-options/",
  "https://nucleus.internal.cubase.org/web-services/2014/02/04/refresh-rateboard/",
  "https://nucleus.internal.cubase.org/web-services/2015/02/19/board-sites-live/",
  "https://nucleus.internal.cubase.org/web-services/2018/07/24/setup-new-customer-plesk-test-site-with-docker-workflow/",
  "https://nucleus.internal.cubase.org/web-services/2016/11/09/tony-dockerclisshkey-2017-workflow/",

    // add more URLs here...
  ];
  
  const loaders = urls.map(url => new PuppeteerWebBaseLoader(url, {
    launchOptions: {
      headless: true,
    },
    gotoOptions: {
      waitUntil: "domcontentloaded",
    },
    async evaluate(page, browser) {
      const result = await page.evaluate(() => document.body.innerHTML);
      return result;
    },
  }));

  // Load documents from all URLs
  const docs = (await Promise.all(loaders.map(loader => loader.load()))).flat();
  
  const vectorDimensions = 1536;

  const client = new PineconeClient();
  await client.init({
    apiKey: process.env.PINECONE_API_KEY || '',
    environment: process.env.PINECONE_ENVIRONMENT || ''
  });

  try {
    await createPineconeIndex(client, indexName, vectorDimensions);
    await updatePinecone(client, indexName, docs);
  } catch (err) {
    console.log('error: ', err);
  }

  return NextResponse.json({
    data: 'successfully created index and loaded data into pinecone...'
  });
}

