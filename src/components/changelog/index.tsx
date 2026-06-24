
import useLocaleStore from '@/stores/localeStore';
import { Check, Sparkles, Bug, Zap, Package, Calendar } from 'lucide-react';

export default function ChangelogBar() {
    const { changelog } = useLocaleStore()

    const getIcon = (type: string) => {
        switch (type) {
            case 'feature':
                return <Sparkles className="w-3 h-3 md:w-4 md:h-4" />;
            case 'fix':
                return <Bug className="w-3 h-3 md:w-4 md:h-4" />;
            case 'improvement':
                return <Zap className="w-3 h-3 md:w-4 md:h-4" />;
            default:
                return <Package className="w-3 h-3 md:w-4 md:h-4" />;
        }
    };

    const getBadgeClass = (type: string) => {
        switch (type) {
            case 'feature':
                return 'badge-success';
            case 'fix':
                return 'badge-error';
            case 'improvement':
                return 'badge-warning';
            default:
                return 'badge-info';
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'feature':
                return 'Feature';
            case 'fix':
                return 'Fix';
            case 'improvement':
                return 'Improvement';
            default:
                return 'Update';
        }
    };

    return (
        <div className="md:p-4">
            {/* Alert */}
            {/* <div className="alert alert-info mb-4 md:p-2 p-1">
                <AlertCircle className="w-6 h-6" />
            </div> */}

            {/* Timeline */}
            <div className="flex flex-col gap-4">
                {changelog.map((change, index) => (
                    <div key={index} className="bg-base-100 shadow-sm">
                        <div className="flex flex-col gap-2">
                            {/* Version Header */}
                            <div className="flex flex-row items-center gap-2 md:gap-3">
                                <div className={`badge ${getBadgeClass(change.type)} gap-1 md:gap-2 p-1`}>
                                    {getIcon(change.type)}
                                    {getTypeLabel(change.type)}
                                </div>
                                <h2 className="card-title text-sm md:text-lg">
                                    Version {change.version}
                                </h2>
                                <div className="flex items-center gap-1 md:gap-2 text-base-content/60 ml-auto">
                                    <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                                    <span className="text-sm">{change.date}</span>
                                </div>
                            </div>

                            {/* Changes List */}
                            <ul className="space-y-3">
                                {change.items.map((item, itemIndex) => (
                                    <li key={itemIndex} className="flex items-start gap-3">
                                        <div className="mt-1">
                                            <Check className="w-5 h-5 text-success" />
                                        </div>
                                        <span className="text-base-content">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}