export const BotThinking = ()=>{

    return (
        <>
        <style>
            {`
            .loader-line-3 {
                margin: 0 auto;
                width: 100%;
                height: 5px;
                text-align: center;
                position: relative;
                display: flex;
            }
            .loader-line-3 > div {
                height: 100%;
                width: 100%;
                display: inline-block;
                animation: anm-LL-3-move 0.8s infinite ease-in-out;
            }
            .loader-line-3 .bar1 {
                background-color: #4285f4;
            }
            .loader-line-3 .bar2 {
                background-color: #EA4335;
                animation-delay: -0.7s;
            }
            .loader-line-3 .bar3 {
                background-color: #FBBC05;
                animation-delay: -0.6s;
            }
            .loader-line-3 .bar4 {
                background-color: #34A853;
                animation-delay: -0.5s;
            }
            @keyframes anm-LL-3-move {
                0%, 80%, 100% {
                    transform: scaleY(0.5);
                }
                20% {
                    transform: scaleY(1.1);
                }
            }
            `}
        </style>
        <div className="loader-line-3 gap-1 flex">
            <div className="bar1"></div>
            <div className="bar2"></div>
            <div className="bar3"></div>
            <div className="bar4"></div>
        </div>
        </>
    )
};