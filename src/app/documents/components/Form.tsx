"use client"
import React, { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export default function Form() {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const toastError = () => {
        alert("error");
    }
    const handleSubmit = async () => {
        const content = inputRef.current?.value;
        if (content && content.trim()) {
            const res = await fetch(location.origin + "/embedding", {
                method: "POST",
                body: JSON.stringify({ text: content.replace(/\n/g, " ") }),
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                
            });

            if (res.status !== 200) {
                toastError();
                console.error("Error submitting data:", res.statusText);
                return;
            } else {
                const result = await res.json();
                console.log(result);
            }
        }
    };

    return (
        <>
            <Textarea placeholder="Add your dataset" className="h-96" ref={inputRef} />
            <Button className="w-full" onClick={handleSubmit}>
                Submit
            </Button>
        </>
    )
}
