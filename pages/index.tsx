import React, { PureComponent } from 'react';
import { MatrixEventBase, MatrixImageEvents } from '../helpers/event_types';
import Head from 'next/head';
import Header from '../components/Header';
import { client, ClientContext } from '../components/ClientContext';
import FrontPageImage from '../components/FrontPageImage';
import Footer from '../components/Footer';
import { NextRouter, withRouter } from 'next/router';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { get_data } from './api/directory';

type Props = InferGetStaticPropsType<typeof getStaticProps> & {
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
      return (
        <div className='h-full flex flex-col justify-between bg-[#f8f8f8] dark:bg-[#06070D]'>
          <Head>
            <title key="title">Matrix Art | Home</title>
            <meta property="og:title" content="Matrix Art | Home" key="og-title" />
            <meta property="og:type" content="website" key="og-type" />
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

export const getStaticProps: GetStaticProps = async (context) => {
  let image_events: MatrixImageEvents[] = [];
  try {
    const data = await get_data();

    // TODO fix this somehow. It is super inefficent.
    for (let user of data) {
      // We dont need many events
      const roomId = await client?.followUser(user.user_room);
      const events = await client?.getTimeline(roomId, 100);
      // Filter events by type
      image_events = [...image_events, ...(events.filter((event) => event.type == "m.image_gallery" || event.type == "m.image") as MatrixImageEvents[])];
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