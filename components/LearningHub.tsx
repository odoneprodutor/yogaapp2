

import React, { useState, useEffect } from 'react';
import { Article, Comment } from '../types';
import { knowledgeBase } from '../services/knowledgeBase';
import { Badge, Button, Card } from './ui';
import { ArrowLeft, Clock, BookOpen, Share2, Sparkles, User, Tag, Settings, Plus, X, Image as ImageIcon, Heart, MessageCircle, Send, ThumbsUp, CornerDownRight, Users, Newspaper, Trash2, Video, Link as LinkIcon, MoreHorizontal } from 'lucide-react';
import { authService } from '../services/auth';

export const LearningHub: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [filter, setFilter] = useState<string>('Todos');

    // View Mode State
    const [viewMode, setViewMode] = useState<'OFFICIAL' | 'COMMUNITY'>('COMMUNITY');

    // Current User
    const currentUser = authService.getCurrentUser();

    // --- SOCIAL COMPOSER STATE ---
    const [postText, setPostText] = useState('');
    const [postMediaUrl, setPostMediaUrl] = useState('');
    const [postMediaType, setPostMediaType] = useState<'none' | 'image' | 'video'>('none');
    const [postMediaFile, setPostMediaFile] = useState<File | null>(null);

    const [isComposerExpanded, setIsComposerExpanded] = useState(false);

    // Admin State
    const [isAddAdminArticleOpen, setIsAddAdminArticleOpen] = useState(false);
    const [adminArticleData, setAdminArticleData] = useState<Partial<Article>>({
        category: 'Filosofia',
        readTime: '5 min',
        author: 'Equipe YogaFlow',
        content: []
    });
    const [adminContentInput, setAdminContentInput] = useState('');

    // Comment Form
    const [commentInput, setCommentInput] = useState('');

    // Reply State
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyInput, setReplyInput] = useState('');

    // Load articles on mount
    useEffect(() => {
        refreshArticles();
    }, []);

    const refreshArticles = () => {
        setArticles(knowledgeBase.getAllArticles());
    };

    const dailyArticle = knowledgeBase.getDailyArticle();

    // Updated Filters
    const filterOptions = ['Todos', 'Filosofia', 'Benefícios', 'Inspiração', 'Anatomia'];

    // Enhanced Filtering Logic based on ViewMode
    const filteredArticles = articles.filter(a => {
        // 1. Filter by View Mode (Tab)
        if (viewMode === 'OFFICIAL' && a.isUserGenerated) return false;
        if (viewMode === 'COMMUNITY' && !a.isUserGenerated) return false;

        // 2. Filter by Category
        if (filter === 'Todos') return true;
        return a.category === filter;
    });

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPostMediaFile(file);
            setPostMediaType(type);
            // Create local preview URL
            const previewUrl = URL.createObjectURL(file);
            setPostMediaUrl(previewUrl);
        }
    };

    // Helper to convert File to Base64 (for Mock Mode)
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!postText.trim()) return;

        let finalMediaUrl = postMediaUrl;

        // Process File if exists
        if (postMediaFile) {
            try {
                // In a Real App: FormData upload to API
                // const formData = new FormData();
                // formData.append('file', postMediaFile);
                // const res = await fetch('/api/upload', { method: 'POST', body: formData });
                // finalMediaUrl = (await res.json()).url;

                // MOCK MODE: Convert to Base64 to save in LocalStorage
                finalMediaUrl = await fileToBase64(postMediaFile);

            } catch (err) {
                console.error("Error processing file", err);
                alert("Erro ao processar imagem.");
                return;
            }
        }

        const articleToAdd: Article = {
            id: Date.now().toString(),
            userId: currentUser?.id,
            title: postText.slice(0, 50) + (postText.length > 50 ? '...' : ''), // Implicit title
            excerpt: postText,
            imageUrl: postMediaType !== 'none' ? finalMediaUrl : '',
            mediaType: postMediaType,
            category: 'Inspiração', // Default category for social posts
            author: currentUser?.name || 'Membro da Comunidade',
            readTime: '1 min',
            content: [postText], // Store full text as content
            likes: 0,
            likedBy: [],
            comments: [],
            isUserGenerated: true
        };

        knowledgeBase.addArticle(articleToAdd);
        refreshArticles();

        // Reset Composer
        setPostText('');
        setPostMediaUrl('');
        setPostMediaFile(null);
        setPostMediaType('none');
        setIsComposerExpanded(false);
    };

    const handleDeleteArticle = (e: React.MouseEvent, articleId: string) => {
        e.stopPropagation();
        if (window.confirm("Tem certeza que deseja apagar esta publicação?")) {
            const updatedArticles = knowledgeBase.deleteArticle(articleId);
            setArticles(updatedArticles || knowledgeBase.getAllArticles());
            if (selectedArticle?.id === articleId) {
                setSelectedArticle(null);
            }
        }
    };

    const handleLikeArticle = (e?: React.MouseEvent, article?: Article) => {
        e?.stopPropagation();
        const target = article || selectedArticle;
        if (target && currentUser) {
            const updated = knowledgeBase.toggleLike(target.id, currentUser.id);
            if (updated) {
                if (selectedArticle && selectedArticle.id === target.id) {
                    setSelectedArticle(updated);
                }
                refreshArticles();
            }
        }
    };

    const handlePostComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentInput.trim() || !selectedArticle) return;

        const updated = knowledgeBase.addComment(selectedArticle.id, commentInput);
        if (updated) {
            setSelectedArticle(updated);
            refreshArticles();
            setCommentInput('');
        }
    };

    const handleLikeComment = (commentId: string) => {
        if (selectedArticle && currentUser) {
            const updated = knowledgeBase.toggleCommentLike(selectedArticle.id, commentId, currentUser.id);
            if (updated) {
                setSelectedArticle(updated);
                refreshArticles();
            }
        }
    };

    const handleReplyToComment = (parentCommentId: string) => {
        if (!replyInput.trim() || !selectedArticle) return;

        const updated = knowledgeBase.addReply(selectedArticle.id, parentCommentId, replyInput);
        if (updated) {
            setSelectedArticle(updated);
            refreshArticles();
            setReplyInput('');
            setReplyingTo(null);
        }
    };

    const handleCreateAdminArticle = (e: React.FormEvent) => {
        e.preventDefault();
        if (!adminArticleData.title || !adminArticleData.excerpt || !adminContentInput || !adminArticleData.imageUrl) {
            alert("Por favor preencha todos os campos.");
            return;
        }

        const paragraphs = adminContentInput.split('\n').filter(p => p.trim().length > 0);

        const articleToAdd: Article = {
            id: Date.now().toString(),
            // No userId implies official/system content usually, but we can store admin ID
            userId: currentUser?.id,
            title: adminArticleData.title,
            excerpt: adminArticleData.excerpt,
            imageUrl: adminArticleData.imageUrl,
            category: adminArticleData.category as any,
            author: adminArticleData.author || 'Equipe YogaFlow',
            readTime: adminArticleData.readTime || '5 min',
            content: paragraphs,
            likes: 0,
            likedBy: [],
            comments: [],
            isUserGenerated: false // It is official
        };

        knowledgeBase.addArticle(articleToAdd);
        refreshArticles();
        setIsAddAdminArticleOpen(false);
        setAdminContentInput('');
        setAdminArticleData({
            category: 'Filosofia',
            readTime: '5 min',
            author: 'Equipe YogaFlow',
            excerpt: '',
            title: '',
            imageUrl: ''
        });
    };

    // Helper to render comments recursively
    const renderComment = (comment: Comment, isReply = false) => {
        const isLikedByMe = currentUser ? (comment.likedBy || []).includes(currentUser.id) : false;
        const isReplying = replyingTo === comment.id;

        return (
            <div key={comment.id} className={`group bg-white p-4 rounded-xl border border-stone-100 mb-3 ${isReply ? 'ml-8 md:ml-12 border-l-4 border-l-sage-100' : ''}`}>
                <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 text-xs ${isReply ? 'bg-stone-50 text-stone-500' : 'bg-stone-100 text-stone-600'}`}>
                        {comment.userName.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                                <span className="font-bold text-sage-900 text-sm">{comment.userName}</span>
                                <span className="text-[10px] text-stone-400">
                                    {new Date(comment.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                </span>
                            </div>
                        </div>
                        <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
                            {comment.text}
                        </p>

                        {/* Interaction Actions */}
                        <div className="mt-2 flex gap-3">
                            <button
                                onClick={() => handleLikeComment(comment.id)}
                                className={`text-xs font-medium flex items-center gap-1 transition-colors ${isLikedByMe ? 'text-red-500' : 'text-stone-400 hover:text-sage-600'}`}
                            >
                                <ThumbsUp size={10} fill={isLikedByMe ? "currentColor" : "none"} />
                                {comment.likes > 0 ? comment.likes : 'Curtir'}
                            </button>

                            <button
                                onClick={() => setReplyingTo(isReplying ? null : comment.id)}
                                className="text-xs font-medium text-stone-400 hover:text-sage-600 flex items-center gap-1 transition-colors"
                            >
                                <MessageCircle size={10} /> Responder
                            </button>
                        </div>

                        {/* Reply Input */}
                        {isReplying && (
                            <div className="mt-2 animate-fade-in pl-2 border-l-2 border-sage-100">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        autoFocus
                                        value={replyInput}
                                        onChange={(e) => setReplyInput(e.target.value)}
                                        placeholder={`Respondendo a ${comment.userName}...`}
                                        className="flex-1 p-1.5 bg-stone-50 border border-stone-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-sage-300"
                                    />
                                    <Button size="sm" onClick={() => handleReplyToComment(comment.id)} disabled={!replyInput.trim()} className="h-full py-1 px-2 text-xs">
                                        <Send size={12} />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Render Replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-2 space-y-2 pt-1 border-t border-stone-50/50">
                        {comment.replies.map(reply => renderComment(reply, true))}
                    </div>
                )}
            </div>
        );
    };

    // --- RENDER COMPONENT ---

    return (
        <div className="pb-24 pt-8 px-4 max-w-5xl mx-auto animate-fade-in relative">
            <div className="mb-6">
                <h1 className="text-3xl font-light text-sage-900">Aprendizado Diário</h1>
                <p className="text-stone-500">Nutra sua mente com sabedoria e troque experiências.</p>
            </div>

            {/* --- ADMIN ARTICLE COMPOSER (Official Only) --- */}
            <div className="flex flex-wrap sm:flex-nowrap gap-4 border-b border-stone-200 mb-6 items-end">
                <button
                    onClick={() => { setViewMode('COMMUNITY'); setFilter('Todos'); }}
                    className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${viewMode === 'COMMUNITY'
                        ? 'border-sage-600 text-sage-800'
                        : 'border-transparent text-stone-400 hover:text-stone-600'
                        }`}
                >
                    <Users size={18} /> Comunidade
                </button>
                <button
                    onClick={() => { setViewMode('OFFICIAL'); setFilter('Todos'); }}
                    className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${viewMode === 'OFFICIAL'
                        ? 'border-sage-600 text-sage-800'
                        : 'border-transparent text-stone-400 hover:text-stone-600'
                        }`}
                >
                    <Newspaper size={18} /> Artigos & Estudos
                </button>

                <div className="flex-1 w-full sm:w-auto"></div>

                {/* Admin Action Button */}
                {viewMode === 'OFFICIAL' && currentUser?.isAdmin && (
                    <button
                        onClick={() => setIsAddAdminArticleOpen(true)}
                        className="flex items-center gap-2 px-3 py-2 sm:py-1.5 bg-stone-800 text-white text-xs font-medium rounded-full hover:bg-stone-900 transition-colors shadow-sm self-center sm:self-auto mb-2 sm:mb-2 ml-auto sm:ml-0"
                    >
                        <Plus size={16} />
                        <span className="hidden sm:inline">Novo Artigo Oficial</span>
                    </button>
                )}
            </div>

            {/* --- SOCIAL COMPOSER (Community Only) --- */}
            {viewMode === 'COMMUNITY' && (
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-200 mb-8 animate-fade-in">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center text-sage-700 font-bold shrink-0">
                            {currentUser?.name.charAt(0) || 'U'}
                        </div>
                        {/* min-w-0 Fixes flex overflow issues on mobile */}
                        <div className="flex-1 min-w-0">
                            <textarea
                                value={postText}
                                onClick={() => setIsComposerExpanded(true)}
                                onChange={(e) => setPostText(e.target.value)}
                                placeholder="No que você está pensando hoje?"
                                className={`w-full bg-stone-50 border-none rounded-xl focus:ring-0 focus:bg-stone-100 transition-all text-stone-700 placeholder-stone-400 p-3 resize-none ${isComposerExpanded ? 'h-32' : 'h-12'}`}
                            />

                            {/* Options Buttons */}
                            {isComposerExpanded && (
                                <div className="mt-3 animate-fade-in">
                                    {/* Media Preview */}
                                    {postMediaType !== 'none' && postMediaUrl && (
                                        <div className="mb-3 relative inline-block">
                                            {postMediaType === 'image' ? (
                                                <img src={postMediaUrl} alt="Preview" className="h-20 w-auto rounded-lg border border-stone-200 object-cover" />
                                            ) : (
                                                <div className="h-20 w-32 bg-black rounded-lg flex items-center justify-center text-white">
                                                    <Video size={20} />
                                                </div>
                                            )}
                                            <button
                                                onClick={() => { setPostMediaType('none'); setPostMediaUrl(''); setPostMediaFile(null); }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    )}

                                    {/* Hidden File Inputs */}
                                    <input
                                        type="file"
                                        id="image-upload"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleFileSelect(e, 'image')}
                                    />
                                    {/* For now, video upload is also treated as file upload logic, but maybe limited support in mock */}
                                    {/* <input type="file" id="video-upload" accept="video/*" className="hidden" onChange={(e) => handleFileSelect(e, 'video')} /> */}

                                    <div className="flex items-center justify-between flex-wrap gap-y-2">
                                        <div className="flex gap-2">
                                            <label
                                                htmlFor="image-upload"
                                                className={`cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${postMediaType === 'image' ? 'bg-sage-100 text-sage-700' : 'bg-stone-50 text-stone-500 hover:bg-stone-100'}`}
                                            >
                                                <ImageIcon size={16} className="text-blue-500" /> Foto
                                            </label>

                                            {/* Video Upload - placeholder logic, maybe use URL for video still? Or file? Let's keep it simple: just Image upload fully implemented first or generic file. User asked for upload. */}
                                            {/* For simplicity in this iteration, I'll temporarily disable video upload or make it strictly a file upload too if requested? 
                                                User said "photos and videos". Let's enable video file input too.
                                            */}
                                            <label
                                                // htmlFor="video-upload" - re-enable if we want video file upload
                                                onClick={() => alert("Upload de vídeo em breve! (Use Imagens por enquanto)")}
                                                className={`cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors bg-stone-50 text-stone-500 hover:bg-stone-100 opacity-60`}
                                            >
                                                <Video size={16} className="text-red-500" /> Vídeo
                                            </label>
                                        </div>
                                        <div className="flex gap-2 ml-auto">
                                            <Button variant="ghost" size="sm" onClick={() => { setIsComposerExpanded(false); setPostText(''); setPostMediaType('none'); }}>Cancelar</Button>
                                            <Button size="sm" onClick={handleCreatePost} disabled={!postText.trim()}>Publicar</Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!isComposerExpanded && (
                                <div className="flex justify-end mt-2">
                                    <button onClick={() => setIsComposerExpanded(true)} className="text-stone-400 hover:text-sage-600 text-xs font-medium flex gap-1 items-center">
                                        <ImageIcon size={14} /> Mídia
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}


            {/* --- OFFICIAL VIEW: Category Filters --- */}
            {viewMode === 'OFFICIAL' && (
                <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-6" role="tablist">
                    {filterOptions.map(opt => (
                        <button
                            key={opt}
                            role="tab"
                            aria-selected={filter === opt}
                            onClick={() => setFilter(opt)}
                            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors border ${filter === opt
                                ? 'bg-sage-600 text-white border-sage-600'
                                : 'bg-white text-stone-600 border-stone-200 hover:border-sage-400'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            )}

            {/* --- ARTICLE / POST LIST --- */}
            <div className={viewMode === 'OFFICIAL' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in" : "flex flex-col gap-6 animate-fade-in max-w-2xl mx-auto"}>
                {filteredArticles.map(article => {
                    const isMyPost = currentUser && article.userId === currentUser.id;
                    const isLikedByMe = currentUser ? (article.likedBy || []).includes(currentUser.id) : false;

                    // --- RENDER SOCIAL CARD (COMMUNITY MODE) ---
                    if (viewMode === 'COMMUNITY') {
                        return (
                            <div key={article.id} className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                                <div className="p-4">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-500">
                                                {article.author.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-stone-900 text-sm">{article.author}</h4>
                                                <p className="text-xs text-stone-400 flex items-center gap-1">
                                                    {article.readTime || 'Agora mesmo'} • <Users size={10} />
                                                </p>
                                            </div>
                                        </div>
                                        {isMyPost && (
                                            <button onClick={(e) => handleDeleteArticle(e, article.id)} className="text-stone-300 hover:text-red-500 p-2">
                                                <MoreHorizontal size={20} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Text Content */}
                                    <p className="text-stone-800 text-sm leading-relaxed whitespace-pre-line mb-3">
                                        {article.content && article.content.length > 0 ? article.content.join('\n') : article.excerpt}
                                    </p>

                                    {/* Media Attachment */}
                                    {article.imageUrl && (
                                        <div className="rounded-xl overflow-hidden bg-stone-100 mb-3 border border-stone-100">
                                            {/* Basic check for now; ideally postMediaType tells us what it is. Fallback to img if not specified or image. */}
                                            {article.mediaType === 'video' ? (
                                                <div className="w-full aspect-video flex items-center justify-center bg-black text-white">
                                                    {/* Placeholder for video player logic */}
                                                    <div className="text-center">
                                                        <Video size={32} className="mx-auto mb-2 opacity-50" />
                                                        <span className="text-xs opacity-50 block">Vídeo Externo</span>
                                                        <a href={article.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-xs">{article.imageUrl}</a>
                                                    </div>
                                                </div>
                                            ) : (
                                                <img src={article.imageUrl} alt="Anexo do post" className="w-full h-auto object-cover max-h-96" loading="lazy" />
                                            )}
                                        </div>
                                    )}

                                    {/* Metrics & Actions */}
                                    <div className="flex items-center justify-between pt-3 border-t border-stone-50 mt-2">
                                        <div className="flex gap-4">
                                            <button
                                                onClick={(e) => handleLikeArticle(e, article)}
                                                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${isLikedByMe ? 'text-red-500' : 'text-stone-500 hover:text-stone-700'}`}
                                            >
                                                <Heart size={18} fill={isLikedByMe ? "currentColor" : "none"} />
                                                {article.likes > 0 && <span>{article.likes}</span>}
                                                <span className="hidden sm:inline">Curtir</span>
                                            </button>
                                            <button
                                                onClick={() => setSelectedArticle(article)}
                                                className="flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-700 transition-colors"
                                            >
                                                <MessageCircle size={18} />
                                                {article.comments.length > 0 && <span>{article.comments.length}</span>}
                                                <span className="hidden sm:inline">Comentar</span>
                                            </button>
                                        </div>

                                        <button className="text-stone-400 hover:text-sage-600 p-1">
                                            <Share2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    // --- RENDER OFFICIAL ARTICLE CARD (OFFICIAL MODE) ---
                    return (
                        <div
                            key={article.id}
                            onClick={() => setSelectedArticle(article)}
                            className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden cursor-pointer group hover:border-sage-300 transition-colors h-full flex flex-col relative"
                        >
                            <div className="h-48 overflow-hidden bg-stone-100 relative">
                                <img
                                    src={article.imageUrl}
                                    alt=""
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute top-2 right-2 flex gap-1">
                                    <div className="bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-stone-600 uppercase tracking-wider shadow-sm">
                                        {article.category}
                                    </div>
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-lg font-medium text-sage-900 mb-2 leading-snug group-hover:text-sage-700 transition-colors">
                                    {article.title}
                                </h3>
                                <p className="text-sm text-stone-500 line-clamp-2 mb-4 flex-1">
                                    {article.excerpt}
                                </p>

                                <div className="flex items-center justify-between text-xs text-stone-400 mt-auto pt-4 border-t border-stone-50">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1"><Heart size={12} /> {article.likes}</span>
                                        <span className="flex items-center gap-1"><MessageCircle size={12} /> {article.comments?.length || 0}</span>
                                    </div>
                                    <span className="flex items-center gap-1"><User size={12} /> {article.author.split(' ')[0]}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* DETAIL VIEW OVERLAY is basically same for both but maybe lighter for Social? Reusing existing detail view for now as it handles comments well. */}
            {selectedArticle && (
                <div className="fixed inset-0 bg-white z-50 overflow-y-auto animate-fade-in flex flex-col">
                    {/* Navigation Bar */}
                    <nav className="sticky top-0 bg-white/95 backdrop-blur-md z-20 border-b border-stone-100 px-4 h-14 flex items-center justify-between max-w-5xl mx-auto w-full">
                        <Button variant="ghost" onClick={() => setSelectedArticle(null)} className="text-stone-600 hover:bg-stone-100 -ml-2 gap-2 pl-2 pr-4 text-sm">
                            <ArrowLeft size={18} /> Voltar
                        </Button>
                        <span className="font-bold text-stone-800 text-sm truncate max-w-[200px] hidden sm:block">{selectedArticle.title}</span>
                        <div className="w-8"></div> {/* Spacer */}
                    </nav>

                    <div className="flex-1 overflow-y-auto bg-stone-50">
                        <div className="max-w-2xl mx-auto py-6 px-4">
                            {/* Content Wrapper */}
                            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 mb-6">
                                {/* Author Header */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-500 text-lg">
                                        {selectedArticle.author.charAt(0)}
                                    </div>
                                    <div>
                                        <h1 className="font-bold text-xl text-stone-900 leading-tight">{selectedArticle.title}</h1>
                                        <p className="text-sm text-stone-500">
                                            {selectedArticle.author} • {selectedArticle.readTime}
                                        </p>
                                    </div>
                                </div>

                                {/* Just Full Content for Social posts */}
                                <div className="prose prose-stone max-w-none mb-6 text-stone-800">
                                    {selectedArticle.content.map((p, i) => (
                                        <p key={i} className="whitespace-pre-line mb-4">{p}</p>
                                    ))}
                                </div>

                                {/* Image */}
                                {selectedArticle.imageUrl && (
                                    <div className="rounded-xl overflow-hidden mb-6 bg-stone-100">
                                        <img src={selectedArticle.imageUrl} className="w-full h-auto" />
                                    </div>
                                )}

                                {/* Stats */}
                                <div className="flex items-center gap-4 text-stone-500 text-sm border-t border-stone-100 pt-4">
                                    <span className="flex items-center gap-1"><Heart size={16} /> {selectedArticle.likes} curtidas</span>
                                    <span className="flex items-center gap-1"><MessageCircle size={16} /> {selectedArticle.comments.length} comentários</span>
                                </div>
                            </div>

                            {/* Comments Section */}
                            <h3 className="text-lg font-bold text-stone-800 mb-4 px-2">Comentários</h3>

                            {/* Input */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 mb-6 flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-sage-100 shrink-0 flex items-center justify-center font-bold text-sage-800 text-xs">
                                    {currentUser?.name.charAt(0)}
                                </div>
                                <form onSubmit={handlePostComment} className="flex-1">
                                    <textarea
                                        value={commentInput}
                                        onChange={(e) => setCommentInput(e.target.value)}
                                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm resize-none h-20 placeholder-stone-400"
                                        placeholder="Escreva um comentário..."
                                    />
                                    <div className="flex justify-end pt-2 border-t border-stone-50 mt-2">
                                        <Button type="submit" size="sm" disabled={!commentInput.trim()}>Comentar</Button>
                                    </div>
                                </form>
                            </div>

                            {/* List */}
                            <div className="space-y-4">
                                {selectedArticle.comments && selectedArticle.comments.length > 0 ? (
                                    [...selectedArticle.comments].reverse().map(c => renderComment(c))
                                ) : (
                                    <p className="text-center text-stone-400 py-8">Nenhum comentário ainda.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* ADMIN ADD ARTICLE MODAL */}
            {isAddAdminArticleOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50 rounded-t-3xl">
                            <h3 className="text-xl font-light text-sage-900">Novo Artigo Oficial</h3>
                            <button onClick={() => setIsAddAdminArticleOpen(false)} className="text-stone-400 hover:text-stone-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 flex-1">
                            <form id="add-admin-article-form" onSubmit={handleCreateAdminArticle} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Título do Artigo</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-300 text-lg font-medium"
                                        placeholder="Título..."
                                        value={adminArticleData.title || ''}
                                        onChange={(e) => setAdminArticleData({ ...adminArticleData, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Categoria</label>
                                        <select
                                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-300"
                                            value={adminArticleData.category}
                                            onChange={(e) => setAdminArticleData({ ...adminArticleData, category: e.target.value as any })}
                                        >
                                            {['Filosofia', 'Benefícios', 'Inspiração', 'Anatomia'].map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Tempo de Leitura</label>
                                        <input
                                            type="text"
                                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-300"
                                            placeholder="Ex: 5 min"
                                            value={adminArticleData.readTime || ''}
                                            onChange={(e) => setAdminArticleData({ ...adminArticleData, readTime: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Imagem de Capa (URL)</label>
                                    <div className="relative">
                                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                        <input
                                            required
                                            type="text"
                                            className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-300"
                                            placeholder="https://..."
                                            value={adminArticleData.imageUrl || ''}
                                            onChange={(e) => setAdminArticleData({ ...adminArticleData, imageUrl: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Resumo (Para o Card)</label>
                                    <textarea
                                        required
                                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-300 h-20"
                                        placeholder="Resumo..."
                                        value={adminArticleData.excerpt || ''}
                                        onChange={(e) => setAdminArticleData({ ...adminArticleData, excerpt: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Conteúdo Completo</label>
                                    <textarea
                                        required
                                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-300 h-64"
                                        placeholder="Conteúdo..."
                                        value={adminContentInput}
                                        onChange={(e) => setAdminContentInput(e.target.value)}
                                    />
                                    <p className="text-xs text-stone-400 mt-2">Quebras de linha criam novos parágrafos.</p>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-stone-100 flex justify-end gap-3 rounded-b-3xl bg-white">
                            <Button variant="ghost" onClick={() => setIsAddAdminArticleOpen(false)}>Cancelar</Button>
                            <Button type="submit" form="add-admin-article-form">Publicar Artigo</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
