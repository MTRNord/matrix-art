import { Header } from "../components/header";
import { Post } from "../components/post";
import { Plock } from "react-plock";
import { UserData } from "../data/user";
import { PostData } from "../data/post";


const BREAKPOINTS = [
    { size: 500, columns: 1 },
    { size: 800, columns: 2 },
    { size: 1400, columns: 3 },
    { size: 1401, columns: 4 },
];

export function Home() {
    return (
        <div className="flex flex-col">
            <header>
                <Header />
            </header>
            <main className="m-12 mt-6">
                <h1 className="text-3xl font-bold mb-4 text-white">Explore</h1>
                <div className="flex justify-center" id="gallery">
                    <Plock gap={"24px"} breakpoints={BREAKPOINTS}>
                        {/* 
                            // @ts-ignore */}
                        <Post user={new UserData("", "Person A", "https://images.unsplash.com/photo-1519699047748-de8e457a634e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=922&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY3Mjc3NzYyNA&ixlib=rb-4.0.3&q=80&w=922")} post={new PostData("", { file: { url: "https://images.unsplash.com/photo-1648773009733-1eab564f3330?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=922&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY3Mjc3Nzk0MA&ixlib=rb-4.0.3&q=80&w=614" } })} />
                        {/* 
                            // @ts-ignore */}
                        <Post user={new UserData("", "Person B", "https://images.unsplash.com/photo-1485893086445-ed75865251e0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=80&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY3Mjc3Nzc2Ng&ixlib=rb-4.0.3&q=80&w=80")} post={new PostData("", { file: { url: "https://images.unsplash.com/photo-1648775933902-f633de370964?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=922&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY3Mjc3ODE1OQ&ixlib=rb-4.0.3&q=80&w=1383" } })} />
                        {/* 
                            // @ts-ignore */}
                        <Post user={new UserData("", "Person C", "https://images.unsplash.com/photo-1584997159889-8bb96d0a2217?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=80&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY3Mjc3ODAxNw&ixlib=rb-4.0.3&q=80&w=80")} post={new PostData("", { file: { url: "https://images.unsplash.com/photo-1648793633175-f3635585014b?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=922&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY3Mjc3ODIwNA&ixlib=rb-4.0.3&q=80&w=614" } })} />
                        {/* 
                            // @ts-ignore */}
                        <Post user={new UserData("", "Person D", "https://images.unsplash.com/photo-1543123820-ac4a5f77da38?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=80&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY3Mjc3ODA0Ng&ixlib=rb-4.0.3&q=80&w=80")} post={new PostData("", { file: { url: "https://images.unsplash.com/photo-1648775170273-dcbe48fb12a0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=922&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY3Mjc3ODI1Ng&ixlib=rb-4.0.3&q=80&w=1229" } })} />
                        {/* 
                            // @ts-ignore */}
                        <Post user={new UserData("", "Person E", "https://images.unsplash.com/photo-1595687825617-10c4d36566e7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=80&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY3Mjc3ODA3Mw&ixlib=rb-4.0.3&q=80&w=80")} post={new PostData("", { file: { url: "https://images.unsplash.com/photo-1648769244858-6e20b5999a6b?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=922&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY3Mjc3ODI5Nw&ixlib=rb-4.0.3&q=80&w=651" } })} />
                        {/* 
                            // @ts-ignore */}
                        <Post user={new UserData("", "Person E", "https://images.unsplash.com/photo-1609010586352-ce4e725aa565?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=80&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY3Mjc3ODA5Mg&ixlib=rb-4.0.3&q=80&w=80")} post={new PostData("", { file: { url: "https://images.unsplash.com/photo-1648750690732-f6eb85984ff8?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=921&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY3Mjc3ODM1NQ&ixlib=rb-4.0.3&q=80&w=614" } })} />
                    </Plock>
                </div>
            </main>
        </div>
    );
}