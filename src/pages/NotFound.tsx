const NotFoundPage = () => {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-white p-4 md:p-10 ">
            <div className="max-w-5xl w-full bg-white shadow-card rounded-md overflow-hidden grid grid-cols-1 md:grid-cols-2 ">
                {/* LEFT SECTION */}
                <div className="p-10 flex flex-col justify-center shadow-card rounded-md">
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold w-fit mb-4">
                        404 error
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
                        Page not found
                    </h1>
                    <p className="text-gray-600 leading-relaxed mb-8">
                        Sorry, we couldn't find the page you're looking for.
                        The link might be broken or the page may have been removed.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => window.history.back()}
                            className="px-5 py-3 bg-black text-white rounded-lg font-medium hover:bg-opacity-90 transition"
                        >
                            ← Return to home
                        </button>
                        {/* <a
                            href="/"
                            className="px-5 py-3 border border-gray-300 text-gray-800 rounded-lg font-medium hover:bg-gray-50 transition"
                        >
                            Home
                        </a> */}
                    </div>
                    <button className="mt-4 text-gray-500 underline text-sm w-fit">
                        Contact support
                    </button>
                </div>
                {/* RIGHT SECTION — IMAGE */}
                <div className="relative from-pink-50 to-indigo-50 flex items-center justify-center p-6">
                    {/* <img
                        src="/404error.avif"
                        alt="404 Illustration"
                        className="w-full max-w-md object-contain drop-shadow-lg"
                    /> */}
                    <h1 className="text-[200px] font-extrabold text-gray-400 leading-none drop-shadow-[0_0_20px_#ffffff55]">
                        404
                    </h1>

                </div>
            </div>
            <p className="absolute bottom-4 text-xs text-gray-400">
                Designed with ❤️ — nigga
            </p>
        </div>
    );
};

export default NotFoundPage;
