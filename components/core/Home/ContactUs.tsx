import AnimatedDotText from "@/components/common/AnimateDot";
import { Button } from "@/components/ui/button";

import {
    Field,
    FieldDescription,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function ContactUs() {
    return (
        <div className="min-h-screen relative bg-background">
            <div className="flex flex-col items-center justify-center mt-30">
                <AnimatedDotText text="Contact" className="mb-2" />
                <h2 className="uppercase text-4xl w-full text-center">Let's Connect</h2>
                {/* <h2 className="uppercase text-4xl w-full text-center">We've got answers.</h2> */}
                <p className="text-[16px] text-[#c9c9c9] w-[30%] text-center mt-3">Have a question, suggestion, or collaboration idea? Reach out and we’ll get back to you.</p>
            </div>

            <div className="w-[50%] flex flex-col items-center justify-center mx-auto py-10">
                <Field className="mb-4">
                    <FieldLabel htmlFor="input-field-username" className="text-[16px] uppercase mb-2">Your Name</FieldLabel>
                    <Input
                        id="input-field-username"
                        type="text"
                        placeholder="Enter your username"
                        className="rounded-none h-10 border-[#919191]"
                    />
                </Field>
                <Field className="mt-4 mb-4">
                    <FieldLabel htmlFor="input-field-username" className="text-[16px] uppercase mb-2">Your Email</FieldLabel>
                    <Input
                        id="input-field-username"
                        type="text"
                        placeholder="Enter your email"
                        className="rounded-none h-10 border-[#919191]"
                    />
                </Field>
                <Field className="mt-4 mb-4">
                    <FieldLabel htmlFor="textarea-message" className="text-[16px] uppercase mb-2">Message</FieldLabel>
                    <Textarea id="textarea-message" placeholder="Type your message here." className="rounded-none border-[#919191] h-24" />
                </Field>
                <div className="w-full mt-8">
                    <Button className={'w-full h-10 rounded-none text-[16px] bg-[#82cfff] text-black uppercase hover:bg-[#6b6b6b] hover:text-[#82cfff] cursor-pointer'}>Send Message</Button>
                </div>
            </div>

        </div>
    )
}



