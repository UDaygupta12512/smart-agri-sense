'use client';

import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, Share2, MoreHorizontal, User, Check, Send, ArrowBigUp, ArrowBigDown, ShieldCheck } from 'lucide-react';

interface ForumPostProps {
    title: string;
    author: string;
    category: string;
    content: string;
    likes: number;
    comments: number;
    timeAgo: string;
    isVerified?: boolean;
}

const ForumPostCard: React.FC<ForumPostProps> = ({
    title,
    author,
    category,
    content,
    likes,
    comments,
    timeAgo,
    isVerified,
}) => {
    const [voteStatus, setVoteStatus] = useState<'up' | 'down' | null>(null);
    const [score, setScore] = useState(likes);
    const [showShareToast, setShowShareToast] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [commentList, setCommentList] = useState<{ author: string; text: string; time: string }[]>([]);
    const [commentCount, setCommentCount] = useState(comments);

    const handleUpvote = () => {
        if (voteStatus === 'up') {
            setVoteStatus(null);
            setScore(prev => prev - 1);
        } else {
            setVoteStatus('up');
            setScore(prev => prev + (voteStatus === 'down' ? 2 : 1));
        }
    };

    const handleDownvote = () => {
        if (voteStatus === 'down') {
            setVoteStatus(null);
            setScore(prev => prev + 1);
        } else {
            setVoteStatus('down');
            setScore(prev => prev - (voteStatus === 'up' ? 2 : 1));
        }
    };

    const handleShare = () => {
        const text = `Check out this discussion: "${title}" by ${author} on SmartAgriSense`;
        if (navigator.share) {
            navigator.share({ title, text, url: window.location.href }).catch(() => {});
        } else {
            navigator.clipboard.writeText(text).then(() => {
                setShowShareToast(true);
                setTimeout(() => setShowShareToast(false), 2000);
            });
        }
    };

    return (
        <div className="bg-white dark:bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative">
            {showShareToast && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm animate-in fade-in slide-in-from-top-2">
                    <Check className="h-3 w-3" /> Copied to clipboard!
                </div>
            )}

            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground text-lg hover:text-primary cursor-pointer transition-colors">
                            {title}
                        </h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <span className="font-medium text-foreground/80 flex items-center gap-1">
                                {author}
                                {isVerified && (
                                    <span className="group relative inline-flex items-center cursor-help">
                                        <ShieldCheck className="h-4 w-4 text-green-500 fill-green-500/20" />
                                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2 py-1 text-xs text-background font-medium opacity-0 transition-opacity group-hover:opacity-100 z-10 pointer-events-none">
                                            Verified Expert
                                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-[3px] border-transparent border-t-foreground"></span>
                                        </span>
                                    </span>
                                )}
                            </span>
                            <span>•</span>
                            <span>{timeAgo}</span>
                        </p>
                    </div>
                </div>
                <button 
                    title="More options"
                    aria-label="More options"
                    className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted/50 transition-colors">
                    <MoreHorizontal className="h-5 w-5" />
                </button>
            </div>

            <div className="mb-4">
                <span className="inline-block px-2.5 py-1 rounded-md bg-secondary/10 text-secondary-foreground text-xs font-semibold mb-2">
                    {category}
                </span>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    {expanded ? content : content.slice(0, 120) + (content.length > 120 ? '...' : '')}
                </p>
                {content.length > 120 && (
                    <button onClick={() => setExpanded(!expanded)} className="text-xs text-primary font-semibold mt-1 hover:underline">
                        {expanded ? 'Show less' : 'Read more'}
                    </button>
                )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-muted/50 rounded-full border border-border shadow-sm">
                        <button onClick={handleUpvote}
                            title="Upvote"
                            className={`p-1.5 rounded-l-full hover:bg-muted transition-colors ${voteStatus === 'up' ? 'text-orange-500' : 'text-muted-foreground hover:text-orange-500'}`}>
                            <ArrowBigUp className={`h-5 w-5 ${voteStatus === 'up' ? 'fill-orange-500' : ''}`} />
                        </button>
                        <span className={`text-sm font-bold px-1 min-w-[2ch] text-center ${voteStatus === 'up' ? 'text-orange-500' : voteStatus === 'down' ? 'text-blue-500' : 'text-foreground'}`}>
                            {score}
                        </span>
                        <button onClick={handleDownvote}
                            title="Downvote"
                            className={`p-1.5 rounded-r-full hover:bg-muted transition-colors ${voteStatus === 'down' ? 'text-blue-500' : 'text-muted-foreground hover:text-blue-500'}`}>
                            <ArrowBigDown className={`h-5 w-5 ${voteStatus === 'down' ? 'fill-blue-500' : ''}`} />
                        </button>
                    </div>
                    <button onClick={() => setShowComments(!showComments)}
                        className={`flex items-center gap-1.5 text-sm font-medium transition-colors group ${showComments ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
                        <MessageSquare className={`h-4 w-4 group-hover:scale-110 transition-transform ${showComments ? 'fill-primary/20' : ''}`} />
                        <span>{commentCount} Comments</span>
                    </button>
                </div>
                <button onClick={handleShare} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    <Share2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Share</span>
                </button>
            </div>

            {/* Comment Section */}
            {showComments && (
                <div className="pt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    {commentList.length > 0 && (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {commentList.map((c, i) => (
                                <div key={i} className="flex gap-2 p-2.5 bg-muted/40 rounded-lg">
                                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <User className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-foreground">{c.author}</span>
                                            <span className="text-[10px] text-muted-foreground">{c.time}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">{c.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {commentList.length === 0 && comments > 0 && (
                        <p className="text-xs text-muted-foreground text-center py-2">Previous comments are not loaded in demo mode.</p>
                    )}
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!commentText.trim()) return;
                        let userName = 'You';
                        try { userName = localStorage.getItem('userName') || 'You'; } catch {}
                        setCommentList(prev => [...prev, { author: userName, text: commentText.trim(), time: 'Just now' }]);
                        setCommentCount(prev => prev + 1);
                        setCommentText('');
                    }} className="flex gap-2">
                        <input
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                        <button type="submit" className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50" disabled={!commentText.trim()}>
                            <Send className="h-4 w-4" />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ForumPostCard;
