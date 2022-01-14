import React, { PureComponent } from 'react';
import { MatrixEventBase, MatrixImageEvents } from '../helpers/event_types';
import Head from 'next/head';
import Header from '../components/Header';
import { client, ClientContext } from '../components/ClientContext';
import FrontPageImage, { isImageGalleryEvent } from '../components/FrontPageImage';
import Footer from '../components/Footer';
import { GetServerSideProps, InferGetServerSidePropsType, } from 'next';
import { get_data } from './api/directory';
import { constMatrixArtServer } from '../helpers/matrix_client';

type Props = InferGetServerSidePropsType<typeof getServerSideProps> & {
};

type State = {
  error?: any;
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
    const { error, image_events } = this.state;

    if (error) {
      return (
        <div>Error: {error.message}</div>
      );
    } else {
      const metadata: { "@context": string; "@type": string; contentUrl: string; license: string; thumbnail: any; }[] = image_events.flatMap(event => {
        if (isImageGalleryEvent(event)) {
          return event.content['m.image_gallery'].map(image => {
            return {
              "@context": "https://schema.org/",
              "@type": "ImageObject",
              "contentUrl": this.context.client?.downloadLink(image['m.file'].url)!,
              "thumbnail": {
                "@context": "https://schema.org/",
                "@type": "ImageObject",
                "contentUrl": this.context.client?.downloadLink(image['m.thumbnail'][0].url)!,
                "license": "https://creativecommons.org/licenses/by-nc-nd/4.0/",
                "author": event.content.displayname,
                "name": image['m.text']
              },
              "encodingFormat": image['m.file'].mimetype,
              // TODO get this from the event itself
              "license": "https://creativecommons.org/licenses/by-nc-nd/4.0/",
              "author": event.content.displayname,
              "name": image['m.text']
            };
          });
        } else {
          return {
            "@context": "https://schema.org/",
            "@type": "ImageObject",
            "contentUrl": this.context.client?.downloadLink(event.content['m.file'].url)!,
            "thumbnail": {
              "@context": "https://schema.org/",
              "@type": "ImageObject",
              "contentUrl": this.context.client?.downloadLink(event.content['m.thumbnail'][0].url)!,
              "license": "https://creativecommons.org/licenses/by-nc-nd/4.0/",
              "author": event.content.displayname,
              "name": event.content['m.text']
            },
            "encodingFormat": event.content['m.file'].mimetype,
            // TODO get this from the event itself
            "license": "https://creativecommons.org/licenses/by-nc-nd/4.0/",
            "author": event.content.displayname,
            "name": event.content['m.text']
          };
        }
      });
      return (
        <div className='h-full flex flex-col justify-between bg-[#f8f8f8] dark:bg-[#06070D]'>
          <Head>
            <title key="title">Matrix Art | Home</title>
            <meta property="og:title" content="Matrix Art | Home" key="og-title" />
            <meta property="og:type" content="website" key="og-type" />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(metadata) }} />
            <meta name="description" content="Matrix-Art is a Devianart style application for posting media based on Matrix."></meta>
          </Head>
          <Header></Header>
          <main className='mb-auto lg:pt-20 pt-52 z-0'>
            <div className='z-[100] sticky lg:top-20 top-52 bg-[#fefefe]/[.95] dark:bg-[#14181E]/[.95]'>
              <div className='h-16 px-10 w-full relative grid grid-cols-[1fr_auto_1fr] items-center' id='section-grid'>
                <h1 className='text-xl text-gray-900 dark:text-gray-200 font-bold'>Home</h1>
              </div>
            </div>
            <div className='m-10'>
              <ul className='flex flex-wrap gap-1'>
                {image_events.map(event => <FrontPageImage event={event} key={(event as MatrixEventBase).event_id} />)}
                <li className='grow-[10]'></li>
              </ul>
            </div>
          </main>
          <Footer></Footer>
        </div>
      );
    }
  }

}
Home.contextType = ClientContext;

export const getServerSideProps: GetServerSideProps = async (context) => {
  context.res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59'
  );
  try {
    const data = await get_data();
    if (!client?.accessToken) {
      try {
        let serverUrl = constMatrixArtServer + "/_matrix/client";
        await client?.registerAsGuest(serverUrl);
      } catch (error) {
        console.error("Failed to register as guest:", error);
        return {
          props: {
            image_events: []
          }
        };
      }
    }

    let image_events: MatrixImageEvents[] = [];
    // TODO fix this somehow. It is super inefficent.
    for (let user of data) {
      // We dont need many events
      const roomId = await client?.followUser(user.user_room);
      const events = await client?.getTimeline(roomId, 100);
      // Filter events by type
      let images = events.filter((event) => event.type == "m.image_gallery" || event.type == "m.image") as MatrixImageEvents[];
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
        image_events: image_events
      }
    };
  } catch {
    return { notFound: true, props: {} };
  }
};

export default Home;