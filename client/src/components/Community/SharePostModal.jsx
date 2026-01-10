import React, { useState } from 'react';
import { X, MessageSquare, Send } from 'lucide-react';
import communityService from '../../services/communityService';

const SharePostModal = ({ post, businessName, onClose }) => {
    const [content, setContent] = useState(`ตรวจสอบโพสต์นี้จาก ${businessName}: ${post.title}\n\n`);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await communityService.shareBusinessPost({
                postId: post.id,
                content
            });
            onClose(true); // true = success
        } catch (error) {
            console.error(error);
            // Handle error (toast)
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => onClose(false)}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 relative z-10">
                    <div className="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
                        <button
                            type="button"
                            className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                            onClick={() => onClose(false)}
                        >
                            <span className="sr-only">Close</span>
                            <X className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>

                    <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                            <MessageSquare className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                พูดคุยเกี่ยวกับโพสต์นี้
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500 mb-2">
                                    เริ่มหัวข้อสนทนาเกี่ยวกับ "{post.title}" ในชุมชน
                                </p>
                                <textarea
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-gray-900 placeholder-gray-500"
                                    rows="4"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="แสดงความคิดเห็นของคุณ..."
                                ></textarea>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm items-center disabled:bg-gray-400"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'กำลังส่ง...' : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    โพสต์ลงชุมชน
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                            onClick={() => onClose(false)}
                        >
                            ยกเลิก
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SharePostModal;
