import AnimatedDotText from "@/components/common/AnimateDot";
import { Button } from "@/components/ui/button";

import {
    Field,
    FieldDescription,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { HomeSectionData } from "@/lib/home/queries";

export default function ContactUs({ section }: { section: HomeSectionData }) {
    return (
        <div className="min-h-screen relative bg-background text-white">
            <div className="flex flex-col items-center justify-center pt-20 px-6 md:pt-30">
                {section.eyebrow && <AnimatedDotText text={section.eyebrow} className="mb-2" />}
                <h2 className="uppercase text-3xl md:text-4xl w-full text-center">{section.title}</h2>
                {section.description && (
                    <p className="text-[16px] text-[#c9c9c9] w-full md:w-[60%] lg:w-[30%] text-center mt-3">{section.description}</p>
                )}
            </div>

            <div className="w-full px-6 md:w-[70%] md:px-0 lg:w-[50%] flex flex-col items-center justify-center mx-auto py-10">
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
                    <FieldLabel htmlFor="input-field-email" className="text-[16px] uppercase mb-2">Your Email</FieldLabel>
                    <Input
                        id="input-field-email"
                        type="email"
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



