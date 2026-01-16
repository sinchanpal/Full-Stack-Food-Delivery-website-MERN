import React, { useEffect, useRef, useState } from 'react'
import Nav from './Nav'
import { categories } from '../category'
import CategoryCard from './CategoryCard'
import { FaCircleArrowLeft } from "react-icons/fa6";
import { FaCircleArrowRight } from "react-icons/fa6";
import { useSelector } from 'react-redux';
import ItemCard from './ItemCard';


const UserDashboard = () => {

    //get all shops in current city from redux store
    const { allShopsInUserCity } = useSelector(state => state.user);

    //get all Items in current city from redux store
    const { allItemsInUserCity } = useSelector(state => state.user);

    //get user city from redux store
    const { userCity } = useSelector(state => state.user);


    // This "ref" is like a hook we attach to the slider div so we can control it later
    const catScrollRef = useRef();
    const shopScrollRef = useRef();



    // These states act like switches to turn the buttons ON or OFF
    const [leftCatScrollBtn, setLeftCatScrollBtn] = useState(false); // Hidden by default (you start at the beginning)
    const [rightCatScrollBtn, setRightCatScrollBtn] = useState(true); // Visible by default (there is usually more to see)


    const [leftShopScrollBtn, setLeftShopScrollBtn] = useState(false); // Hidden by default (you start at the beginning)
    const [rightShopScrollBtn, setRightShopScrollBtn] = useState(true); // Visible by default (there is usually more to see)





    // --- THE BRAIN: This function calculates if buttons should show ---
    const checkScroll = () => {

        // 1. Check Categories
        if (catScrollRef.current) {
            const containerCat = catScrollRef.current;

            // 1. LEFT BUTTON LOGIC
            // "Is the scroll amount greater than 0?"
            // If Yes (True) -> We have moved right, so show the Left Button.
            // If No (False) -> We are at the start, hide it.
            setLeftCatScrollBtn(containerCat.scrollLeft > 0);


            // 2. RIGHT BUTTON LOGIC
            // "Have we reached the end of the map?"
            // math: (Distance Traveled) + (visible Screen Size) >= (Total Map Size)
            const isAtEnd = Math.ceil(containerCat.scrollLeft + containerCat.clientWidth) >= containerCat.scrollWidth - 1;

            // If we are at the end (isAtEnd is true), we hide the Right button (setRightCatScrollBtn is false).
            setRightCatScrollBtn(!isAtEnd);
        }


        // 2. Check Shops
        if (shopScrollRef.current) {
            const containerShop = shopScrollRef.current;
            setLeftShopScrollBtn(containerShop.scrollLeft > 0);
            const isAtEnd = Math.ceil(containerShop.scrollLeft + containerShop.clientWidth) >= containerShop.scrollWidth - 1;
            setRightShopScrollBtn(!isAtEnd);
        }


    }


    // ---  THE ASSISTANT: Runs automatically when page loads ---
    useEffect(() => {

        // Step 1: Run the check immediately when the page opens.
        // (This fixes the bug where the button shows even if you have a huge screen and no scroll).
        checkScroll();

        // Step 2: Add a "Listener" to watch if the user resizes their window (or rotates phone).
        // If they do, run 'checkScroll' again to fix the buttons.
        window.addEventListener('resize', checkScroll);

        // Step 3: Cleanup! When the user leaves this page, remove the listener 
        // so we don't slow down the app.
        return () => window.removeEventListener('resize', checkScroll);
    }, [allShopsInUserCity]); //Add 'allShopsInUserCity' here. When data loads, we need to re-check if arrows are needed!


    //This function will handle the scrolling of category cards left or right
    const scrollHandler = (ref, direction) => {
        if (ref.current) {
            ref.current.scrollBy({
                left: direction === "left" ? -250 : 250, // Move -250px (Left) or +250px (Right)
                behavior: 'smooth' // Makes it glide nicely instead of jumping
            })
        }
        // Note: We don't need to call checkScroll() here manually because 
        // the 'onScroll' event in the HTML below will catch the movement
    }


    return (
        <div className='w-screen min-h-screen bg-[#fff9f6] flex flex-col items-center gap-5 pt-24'>

            {/* Nav Bar Section */}
            <Nav />


            {/* All Categories Section */}
            <div className='w-full max-w-5xl flex flex-col gap-5 items-start px-5 md:px-0'>
                <h1 className='text-gray-800 text-2xl sm:text-3xl'>Inspiration for your first order</h1>
                <div className='w-full relative'>


                    {/* ONLY show this button if 'showLeft' is true */}
                    {leftCatScrollBtn &&

                        (<button className='absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10 cursor-pointer' onClick={() => scrollHandler(catScrollRef, "left")}>
                            <FaCircleArrowLeft size={25} />
                        </button>)
                    }


                    {/* All the categorie container */}

                    <div className='w-full flex overflow-x-auto gap-4 pb-2 ' ref={catScrollRef} onScroll={checkScroll}>
                        {/* All Category Cards we have to show here */}
                        {categories?.map((cat, index) => {
                            return (
                                <CategoryCard name={cat.category} image={cat.image} key={index} />
                            )
                        })}
                    </div>


                    {/* ONLY show this button if 'showRight' is true */}

                    {rightCatScrollBtn &&

                        (<button className='absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10 cursor-pointer' onClick={() => scrollHandler(catScrollRef, "right")}>
                            <FaCircleArrowRight size={25} />
                        </button>)}


                </div>
            </div>


            {/* All Shops in the current city */}

            <div className='w-full max-w-5xl flex flex-col gap-5 items-start px-5 md:px-0'>
                <h1 className='text-gray-800 text-2xl sm:text-3xl'>Best Shops In Your City {userCity}</h1>

                <div className='w-full relative'>


                    {/* ONLY show this button if 'showLeft' is true */}
                    {leftShopScrollBtn &&

                        (<button className='absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10 cursor-pointer' onClick={() => scrollHandler(shopScrollRef, "left")}>
                            <FaCircleArrowLeft size={25} />
                        </button>)
                    }


                    {/* All the categorie container */}

                    <div className='w-full flex overflow-x-auto gap-4 pb-2 ' ref={shopScrollRef} onScroll={checkScroll}>
                        {/* All Category Cards we have to show here */}
                        {allShopsInUserCity?.map((shop, index) => { //Add '?' cause This means "If allShopsInUserCity is null, do NOTHING. Do not crash."
                            return (
                                <CategoryCard name={shop.name} image={shop.image} key={index} />
                            )
                        })}
                    </div>


                    {/* ONLY show this button if 'showRight' is true */}

                    {rightShopScrollBtn &&
                        (<button className='absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10 cursor-pointer' onClick={() => scrollHandler(shopScrollRef, "right")}>
                            <FaCircleArrowRight size={25} />
                        </button>)}


                </div>
            </div>

            {/* All Items in current user city shops */}
            <div className='w-full max-w-5xl flex flex-col gap-5 items-start px-5 md:px-0'>
                <h1 className='text-gray-800 text-2xl sm:text-3xl'>Suggested Items In Your City {userCity}</h1>

                <div className='w-full h-auto flex flex-wrap gap-5 justify-center'>
                        {allItemsInUserCity?.map((item,index)=>{
                            return (
                                <ItemCard item={item} key={index}/>
                            )
                        })}
                </div>
            </div>
        </div>
    )
}

export default UserDashboard
