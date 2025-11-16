import React from 'react'
import Image from "next/image";

const Agent = ({userName}: AgentProps) => {

    const isSpeaking = true;

    return (

        <>
            <div className="call-view" >
                <div className="card-interviewer">
                    <div className="avatar">
                        <Image src="/ai-avatar.png" alt={"AI avatar"}
                               width={65} height={54}
                               className="object-cover" />
                        {isSpeaking && <span className="animate-speak"></span>}
                    </div>
                    <h3>AI Interviewer</h3>
                </div>

                <div className="card-border">
                    <div className="card-content">
                        <Image src="/user-avatar.jpg" alt={"user avatar"}
                               width={540} height={540}
                               className="rounded-full object-cover size-[120px]" />
                        {/*<Image src="/about_2.png" alt={"user avatar"}*/}
                        {/*       width={540} height={540}*/}
                        {/*       className="rounded-full object-cover size-[120px]" />*/}
                        {isSpeaking && <span className="animate-speak"></span>}
                        <h3>{userName}</h3>
                    </div>
                </div>
            </div>
        </>
    )
}
export default Agent
