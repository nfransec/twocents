import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
    title: string
    description: string
    icon: LucideIcon
}

export function FeatureCard({ title, description, icon: Icon }: FeatureCardProps) {
    return (
        <div className="bg-gray-700 p-6 rounded-lg shadow-md">
            <div className='flex items-center justify-center w-12 h-12 bg-primary rounded-full mb-4'>
                <Icon className='w-6 h-6 text-white' />
            </div>
            <h3 className='text-lg font-semibold mb-2'>{title}</h3>
            <p className='text-emerald-600'>{description}</p>
        </div>
    )
}