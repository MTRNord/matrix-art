import React, { PureComponent } from 'react';
import { MatrixEventBase, MatrixImageEvents } from '../helpers/event_types';
import Head from 'next/head';
import { client, ClientContext } from '../components/ClientContext';
import FrontPageImage, { isImageGalleryEvent } from '../components/FrontPageImage';
import { GetServerSideProps, InferGetServerSidePropsType, } from 'next';
import { get_data } from './api/directory';
import { constMatrixArtServer } from '../helpers/matrix_client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { i18n, WithTranslation } from 'next-i18next';

type Props = InferGetServerSidePropsType<typeof getServerSideProps> & WithTranslation & {
};

type State = {
  // TODO make sure we parse both extev variants properly
  image_events: MatrixImageEvents[] | [];
};


class Home extends PureComponent<Props, State>{
  declare context: React.ContextType<typeof ClientContext>;

  constructor(props: Props) {
    super(props);

    this.state = {
      image_events: props.image_events,
    } as State;
  }
  render() {
    const { image_events } = this.state;

    const metadata: { "@context": string; "@type": string; contentUrl: string; license: string; thumbnail?: any; }[] = image_events.flatMap(event => {
      if (isImageGalleryEvent(event)) {
        return event.content['m.image_gallery'].map(image => {
          const metadata = {
            "@context": "https://schema.org/",
            "@type": "ImageObject",
            "contentUrl": this.context.client?.downloadLink(image['m.file'].url)!,
            "encodingFormat": image['m.file'].mimetype,
            // TODO get this from the event itself
            "license": "https://creativecommons.org/licenses/by-nc-nd/4.0/",
            "author": event.content.displayname,
            "name": image['m.text'],
            "width": image['m.image'].width,
            "height": image['m.image'].height
          };
          if (image['m.thumbnail']) {
            if (image['m.thumbnail'].length > 0) {
              //@ts-ignore TS is not able to figure out types here
              metadata["thumbnail"] = {
                "@context": "https://schema.org/",
                "@type": "ImageObject",
                "contentUrl": this.context.client?.downloadLink(image['m.thumbnail'][0].url)!,
                "license": "https://creativecommons.org/licenses/by-nc-nd/4.0/",
                "author": event.content.displayname,
                "name": image['m.text']
              };
            }
          }
          return metadata;
        });
      } else {
        const metadata = {
          "@context": "https://schema.org/",
          "@type": "ImageObject",
          "contentUrl": this.context.client?.downloadLink(event.content['m.file'].url)!,
          "encodingFormat": event.content['m.file'].mimetype,
          // TODO get this from the event itself
          "license": "https://creativecommons.org/licenses/by-nc-nd/4.0/",
          "author": event.content.displayname,
          "name": event.content['m.text'],
          "width": event.content['m.image'].width,
          "height": event.content['m.image'].height
        };

        if (event.content['m.thumbnail']) {
          if (event.content['m.thumbnail'].length > 0) {
            //@ts-ignore TS is not able to figure out types here
            metadata["thumbnail"] = {
              "@context": "https://schema.org/",
              "@type": "ImageObject",
              "contentUrl": this.context.client?.downloadLink(event.content['m.thumbnail'][0].url)!,
              "license": "https://creativecommons.org/licenses/by-nc-nd/4.0/",
              "author": event.content.displayname,
              "name": event.content['m.text']
            };
          }
        }

        return metadata;
      }
    });
    return (
      <>
        <Head>
          <title key="title">Matrix Art | {i18n?.t("Home")}</title>
          <meta property="og:title" content="Matrix Art | Home" key="og-title" />
          <meta property="og:type" content="website" key="og-type" />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(metadata) }} />
          <meta name="description" content="Matrix-Art is a Deviantart style application for posting media based on Matrix."></meta>
        </Head>
        <div className='z-[100] sticky lg:top-20 top-[12.5rem] bg-[#fefefe]/[.95] dark:bg-[#12161D]'>
          <div className='h-16 px-10 w-full relative grid grid-cols-[1fr_auto_1fr] items-center' id='section-grid'>
            <h1 className='text-xl text-gray-900 dark:text-gray-200 font-bold'>{i18n?.t("Home")}</h1>
          </div>
        </div>
        <div className='m-10'>
          <ul className='flex flex-wrap gap-1'>
            {image_events.map(event => <FrontPageImage show_nsfw={false} event={event} key={(event as MatrixEventBase).event_id} />)}
            <li className='grow-[10]'></li>
          </ul>
        </div>
      </>
    );
  }

}
Home.contextType = ClientContext;

export const getServerSideProps: GetServerSideProps = async ({ res, locale }) => {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59'
  );
  console.log(`locale: ${locale || 'en'}`);
  try {
    const data = await get_data();
    if (!client?.accessToken) {
      try {
        let serverUrl = constMatrixArtServer + "/_matrix/client";
        console.log(1);
        await client?.registerAsGuest(serverUrl);
      } catch (error) {
        console.error("Failed to register as guest:", error);
        return {
          props: {
            ...(await serverSideTranslations(locale || 'en', ['common'])),
            image_events: []
          }
        };
      }
    }

    let image_events: MatrixImageEvents[] = [];
    // TODO fix this somehow. It is super inefficient.
    for (let user of data) {
      // We dont need many events
      let roomId;
      try {
        roomId = await client?.followUser(user.public_user_room);
      } catch {
        console.error("Unbable to join room");
        continue;
      }
      const events = await client?.getTimeline(roomId, 100);
      // Filter events by type
      let images = events.filter((event) => (event.type == "m.image_gallery" || event.type == "m.image") && !event.unsigned?.redacted_because) as MatrixImageEvents[];
      images = await Promise.all(images.map(async (image) => {
        try {
          const profile = await client.getProfile(image.sender);
          image.content.displayname = profile.displayname;
        } catch {
          image.content.displayname = image.sender;
        }
        return image;
      }));
      image_events = [...image_events, ...images];
      console.log("Adding", image_events.length, "items");
    }


    return {
      props: {
        ...(await serverSideTranslations(locale || 'en', ['common'])),
        image_events: image_events
      }
    };
  } catch (error) {
    console.log(error);
    return { notFound: true, props: {} };
  }
};

export default Home;