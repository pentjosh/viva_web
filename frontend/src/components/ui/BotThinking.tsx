export const BotThinking = ()=>{

    return (
        <>
        <style>
            {`
            .loader-line-3 {
                margin: 0 auto;
                width: 100%;
                height: 3px;
                text-align: center;
                position: relative;
                display: flex;
            }
            .loader-line-3 > div {
                height: 100%;
                width: 100%;
                display: inline-block;
                margin-left: 2px;
                margin-right: 2px;
                animation: anm-LL-3-move 0.8s infinite ease-in-out;
            }
            .loader-line-3 .bar1 {
                background-color: #ef4444;
            }
            .loader-line-3 .bar2 {
                background-color: #f97316;
                animation-delay: -0.7s;
            }
            .loader-line-3 .bar3 {
                background-color: #eab308;
                animation-delay: -0.6s;
            }
            .loader-line-3 .bar4 {
                background-color: #84cc16;
                animation-delay: -0.5s;
            }
            .loader-line-3 .bar5 {
                background-color: #10b981;
                animation-delay: -0.4s;
            }
            .loader-line-3 .bar6 {
                background-color: #0ea5e9;
                animation-delay: -0.3s;
            }
            .loader-line-3 .bar7 {
                background-color: #6366f1;
                animation-delay: -0.2s;
            }
            .loader-line-3 .bar8 {
                background-color: #1d4ed8;
                animation-delay: -0.1s;
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
        <div className="loader-line-3">
            <div className="bar1"></div>
            <div className="bar2"></div>
            <div className="bar3"></div>
            <div className="bar4"></div>
            <div className="bar5"></div>
            <div className="bar6"></div>
            <div className="bar7"></div>
            <div className="bar8"></div>
        </div>
        </>
    )
};