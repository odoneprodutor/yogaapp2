import React from 'react';
import { Pose } from '../types';
import { Badge } from './ui';
import { ArrowLeft, Clock, Activity, Target } from 'lucide-react';

interface PoseDetailProps {
    pose: Pose;
    onBack: () => void;
}

export const PoseDetail: React.FC<PoseDetailProps> = ({ pose, onBack }) => {
    return (
        <div className="pb-24 pt-6 px-4 max-w-4xl mx-auto animate-fade-in">
            <button
                onClick={onBack}
                className="mb-6 flex items-center gap-2 text-stone-500 hover:text-sage-700 transition-colors group"
            >
                <div className="p-2 rounded-full bg-white border border-stone-200 group-hover:bg-sage-100 group-hover:border-sage-300 transition-all">
                    <ArrowLeft size={20} />
                </div>
                <span className="font-medium">Voltar para Biblioteca</span>
            </button>

            <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-stone-100">
                {/* Video Header */}
                <div className="aspect-video w-full bg-black relative">
                    <iframe
                        width="100%"
                        height="100%"
                        src={pose.media.videoEmbedUrl}
                        title={pose.portugueseName}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                    ></iframe>
                </div>

                <div className="p-8">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-light text-sage-900 mb-1">{pose.portugueseName}</h1>
                            <p className="text-lg text-sage-600 italic font-serif">{pose.sanskritName}</p>
                        </div>
                        <Badge color={pose.difficulty === 'Iniciante' ? 'green' : pose.difficulty === 'Intermediário' ? 'blue' : 'orange'}>
                            {pose.difficulty}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-stone-50 p-4 rounded-2xl flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-sage-600 shadow-sm">
                                <Clock size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-stone-400 uppercase">Duração</p>
                                <p className="text-stone-700 font-medium">{pose.durationDefault} segundos</p>
                            </div>
                        </div>

                        <div className="bg-stone-50 p-4 rounded-2xl flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm">
                                <Activity size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-stone-400 uppercase">Categoria</p>
                                <p className="text-stone-700 font-medium">{pose.category}</p>
                            </div>
                        </div>

                        <div className="bg-stone-50 p-4 rounded-2xl flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-500 shadow-sm">
                                <Target size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-stone-400 uppercase">Foco</p>
                                <p className="text-stone-700 font-medium line-clamp-1">{pose.benefits[0] || 'Geral'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <section>
                            <h3 className="text-lg font-medium text-sage-900 mb-3 flex items-center gap-2">
                                Sobre a Postura
                            </h3>
                            <p className="text-stone-600 leading-relaxed text-lg">
                                {pose.description || "Esta postura ajuda a fortalecer o corpo e acalmar a mente. Siga as instruções do vídeo para realizá-la com segurança."}
                            </p>
                        </section>

                        <section>
                            <h3 className="text-lg font-medium text-sage-900 mb-3">Benefícios Principais</h3>
                            <div className="flex flex-wrap gap-2">
                                {pose.benefits.map(benefit => (
                                    <span key={benefit} className="px-3 py-1 bg-sage-50 text-sage-700 rounded-full text-sm font-medium border border-sage-100">
                                        {benefit}
                                    </span>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};
