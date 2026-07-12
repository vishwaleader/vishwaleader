import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pdfDownloadsList, magazineCoversList, createSlug } from "../data";
import { ArrowLeft } from "lucide-react";

export async function generateStaticParams() {
    const pdfSlugs = pdfDownloadsList.map(pdf => ({ slug: createSlug(pdf.title) }));
    const magazineSlugs = magazineCoversList.map(cover => ({ slug: createSlug(cover.title) }));
    return [...pdfSlugs, ...magazineSlugs];
}

export default async function ArchiveDocumentPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const { slug } = params;

    let item: any = pdfDownloadsList.find(pdf => createSlug(pdf.title) === slug);
    let type: 'pdf' | 'image' = 'pdf';

    if (!item) {
        item = magazineCoversList.find(cover => createSlug(cover.title) === slug);
        type = 'image';
    }

    if (!item) {
        notFound();
    }

    return (
        <div className="h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] bg-slate-100 flex flex-col font-sans">
            <div className="flex-grow flex flex-col lg:flex-row w-full overflow-hidden bg-white">
                <div className="hidden lg:flex w-80 shrink-0 border-r border-slate-200 bg-slate-50 p-6 flex-col justify-between overflow-y-auto">
                    <div className="space-y-6">
                        <div className="aspect-[3/4] w-48 mx-auto rounded-xl overflow-hidden bg-white border border-slate-200 shadow-lg relative">
                            {type === 'image' ? (
                                <img src={encodeURI(`/magazine-covers/${item.src}`)} alt="Cover Image" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-slate-100 to-white flex flex-col justify-between p-4">
                                    <div className="absolute top-0 left-0 w-2.5 h-full bg-black/5"></div>
                                    <span className="self-end bg-brandBlue text-white text-[8px] font-bold px-1.5 py-0.5 rounded">VL DOC</span>
                                    <p className="text-slate-900 text-xs font-bold font-display pl-2 leading-tight">{item.title}</p>
                                </div>
                            )}
                        </div>
                        <div className="space-y-3 pt-6 border-t border-slate-200">
                            <div className="flex justify-between items-center text-[10px] font-mono border-b border-slate-100 pb-2">
                                <span className="text-slate-500 uppercase tracking-wider">File Size</span>
                                <span className="text-brandBlue font-bold">{item.size || 'IMG'}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-mono border-b border-slate-100 pb-2">
                                <span className="text-slate-500 uppercase tracking-wider">Document Type</span>
                                <span className="text-amber-500 font-bold">{type === 'pdf' ? 'PDF' : 'JPG'}</span>
                            </div>
                        </div>
                        <div className="pt-2">
                            <h4 className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-2">Description</h4>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                {item.desc || `High resolution scanned archive of the ${item.title} magazine.`}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex-grow p-0 bg-slate-900 relative flex justify-center items-center h-full w-full">
                    {type === 'pdf' ? (
                        <iframe src={`/pdfs/${item.file}#pagemode=thumbs`} className="w-full h-full border-none bg-white" />
                    ) : (
                        <img src={encodeURI(`/magazine-covers/${item.src}`)} className="max-w-full max-h-full object-contain bg-white shadow-2xl" />
                    )}
                </div>
            </div>
        </div>
    );
}
