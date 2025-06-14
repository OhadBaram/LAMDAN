
import React, { useState, useEffect } from "react"; // Added useEffect
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { parseISO } from 'date-fns/parseISO'; 
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell as RechartsCell } from 'recharts';

import { useAppContext } from '../../contexts/AppContext';
import { useUserSettings, CostManagement, initialAppCustomizationData } from '../../contexts/UserSettingsContext'; 

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';

const initialBudgetsData: CostManagement = { 
    dailyBudget: 0, 
    weeklyBudget: 0, 
    monthlyBudget: 0, 
    alertEmail: '' 
};

export function CockpitPage() {
    const { lang, tokenUsage, apiSettings, theme } = useAppContext(); // Added theme
    const { costManagement, setCostManagements, markFeatureVisited } = useUserSettings();

    
    const [editingBudgets, setEditingBudgets] = useState<CostManagement>(() => {
        return {
            dailyBudget: costManagement?.dailyBudget ?? initialBudgetsData.dailyBudget,
            weeklyBudget: costManagement?.weeklyBudget ?? initialBudgetsData.weeklyBudget,
            monthlyBudget: costManagement?.monthlyBudget ?? initialBudgetsData.monthlyBudget,
            alertEmail: costManagement?.alertEmail ?? initialBudgetsData.alertEmail
        };
    });
    
    useEffect(() => {
        setEditingBudgets({
            dailyBudget: costManagement?.dailyBudget ?? initialBudgetsData.dailyBudget,
            weeklyBudget: costManagement?.weeklyBudget ?? initialBudgetsData.weeklyBudget,
            monthlyBudget: costManagement?.monthlyBudget ?? initialBudgetsData.monthlyBudget,
            alertEmail: costManagement?.alertEmail ?? initialBudgetsData.alertEmail
        });
    }, [costManagement]);

    const handleBudgetChange = (field: keyof CostManagement, value: string) => {
        setEditingBudgets(prev => ({
            ...prev, 
            [field]: field === 'alertEmail' ? value : parseFloat(value) || 0 
        }));
    };
    const handleSaveBudgets = () => {
        setCostManagements(editingBudgets);
    };

    if (!tokenUsage || !apiSettings) return <Loader2 className="animate-spin m-auto text-[var(--accent)]"/>;

    const totalCost = tokenUsage.reduce((sum, item) => sum + (item.cost || 0), 0);
    const totalIncomingTokens = tokenUsage.reduce((sum, item) => sum + item.incomingTokens, 0);
    const totalOutgoingTokens = tokenUsage.reduce((sum, item) => sum + item.outgoingTokens, 0);

    const costByProvider = tokenUsage.reduce((acc: {[key:string]: number}, item) => {
        const providerName = apiSettings.find(s => s.provider === item.provider)?.provider || 'Unknown';
        acc[providerName] = (acc[providerName] || 0) + (item.cost || 0);
        return acc;
    }, {});
    const chartDataProviders = Object.entries(costByProvider).map(([name, value]) => ({ name, cost: value }));

    const costOverTime = tokenUsage
        .filter(item => { 
            try {
                parseISO(item.date);
                return true;
            } catch {
                return false;
            }
        })
        .sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
        .map(item => ({ date: format(parseISO(item.date), 'MMM dd'), cost: item.cost || 0}));
    
    const dailyAggregatedCost = costOverTime.reduce((acc: {[key: string]: number}, item) => {
        acc[item.date] = (acc[item.date] || 0) + item.cost;
        return acc;
    }, {});
    const lineChartData = Object.entries(dailyAggregatedCost).map(([date, cost]) => ({ date, cost }));

    const chartTextColor = theme === 'dark' ? '#A9A9A9' : '#6E6E80'; // text-secondary for dark/light
    const chartGridColor = theme === 'dark' ? '#4D4D4F' : '#E5E5E5'; // border for dark/light

    const PIE_COLORS = theme === 'dark' 
        ? ['#10A37F', '#3B82F6', '#F59E0B', '#EF4444', '#A855F7', '#EC4899'] // Brighter for dark
        : ['#10A37F', '#2563EB', '#D97706', '#DC2626', '#9333EA', '#DB2777']; // Standard for light


    return (
        <div className="space-y-4">
            <Card>
                <CardHeader><CardTitle>{lang === 'he' ? 'קוקפיט ניהול עלויות' : 'Cost Management Cockpit'}</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Card className="bg-[var(--error)]/10 border-[var(--error)]/20">
                        <CardHeader className="pb-1.5 pt-3"><CardTitle className="text-sm text-[var(--error)]">{lang === 'he' ? 'עלות כוללת (כל הזמנים)' : 'Total Cost (All Time)'}</CardTitle></CardHeader>
                        <CardContent className="pb-3"><p className="text-2xl font-medium text-[var(--error)]">${totalCost.toFixed(2)}</p></CardContent>
                    </Card>
                    <Card className="bg-blue-500/10 border-blue-500/20">
                        <CardHeader className="pb-1.5 pt-3"><CardTitle className="text-sm text-blue-400">{lang === 'he' ? 'סה"כ טוקנים נכנסים' : 'Total Incoming Tokens'}</CardTitle></CardHeader>
                        <CardContent className="pb-3"><p className="text-2xl font-medium text-blue-400">{totalIncomingTokens.toLocaleString()}</p></CardContent>
                    </Card>
                    <Card className="bg-green-500/10 border-green-500/20">
                        <CardHeader className="pb-1.5 pt-3"><CardTitle className="text-sm text-green-400">{lang === 'he' ? 'סה"כ טוקנים יוצאים' : 'Total Outgoing Tokens'}</CardTitle></CardHeader>
                        <CardContent className="pb-3"><p className="text-2xl font-medium text-green-400">{totalOutgoingTokens.toLocaleString()}</p></CardContent>
                    </Card>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>{lang === 'he' ? 'הגדרות תקציב והתראות' : 'Budget & Alert Settings'}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div><Label htmlFor="dailyBudget">{lang === 'he' ? 'תקציב יומי ($)' : 'Daily Budget ($)'}</Label><Input id="dailyBudget" type="number" value={editingBudgets.dailyBudget} onChange={e => handleBudgetChange('dailyBudget', e.target.value)} /></div>
                        <div><Label htmlFor="weeklyBudget">{lang === 'he' ? 'תקציב שבועי ($)' : 'Weekly Budget ($)'}</Label><Input id="weeklyBudget" type="number" value={editingBudgets.weeklyBudget} onChange={e => handleBudgetChange('weeklyBudget', e.target.value)} /></div>
                        <div><Label htmlFor="monthlyBudget">{lang === 'he' ? 'תקציב חודשי ($)' : 'Monthly Budget ($)'}</Label><Input id="monthlyBudget" type="number" value={editingBudgets.monthlyBudget} onChange={e => handleBudgetChange('monthlyBudget', e.target.value)} /></div>
                    </div>
                     <p className="text-xs text-[var(--text-secondary)]">{lang === 'he' ? 'הערה: התראות על חריגה מהתקציב יוצגו בתוך האפליקציה. שליחת מייל דורשת הגדרת שרת Backend.' : 'Note: Budget overrun alerts will be shown in-app. Email notifications require backend setup.'}</p>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSaveBudgets} variant="default">{lang === 'he' ? 'שמור הגדרות תקציב' : 'Save Budget Settings'}</Button>
                </CardFooter>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                 <Card>
                    <CardHeader><CardTitle>{lang === 'he' ? 'עלות מצטברת לאורך זמן' : 'Cumulative Cost Over Time'}</CardTitle></CardHeader>
                    <CardContent className="h-[250px] sm:h-[300px]">
                        {lineChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lineChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} strokeOpacity={0.5} />
                                <XAxis dataKey="date" tick={{fontSize: 10, fill: chartTextColor}} />
                                <YAxis tick={{fontSize: 10, fill: chartTextColor}} tickFormatter={(value) => `$${value.toFixed(2)}`} />
                                <Tooltip 
                                    formatter={(value: number) => [`$${value.toFixed(2)}`, lang === 'he' ? 'עלות' : 'Cost']}
                                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '0.375rem' }}
                                    labelStyle={{ color: 'var(--text-primary)' }}
                                    itemStyle={{ color: 'var(--text-primary)' }}
                                />
                                <Legend wrapperStyle={{fontSize: '12px', color: chartTextColor}}/>
                                <Line type="monotone" dataKey="cost" stroke="var(--accent)" strokeWidth={2} dot={{r:2, fill: 'var(--accent)'}} activeDot={{r:5}} name={lang === 'he' ? 'עלות יומית' : 'Daily Cost'}/>
                            </LineChart>
                        </ResponsiveContainer>
                        ) : (<p className="text-center text-[var(--text-secondary)]">{lang === 'he' ? 'אין נתוני עלות להצגה.' : 'No cost data to display.'}</p>)}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>{lang === 'he' ? 'התפלגות עלויות לפי ספק' : 'Cost Distribution by Provider'}</CardTitle></CardHeader>
                    <CardContent className="h-[250px] sm:h-[300px]">
                        {chartDataProviders.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={chartDataProviders} 
                                    dataKey="cost" 
                                    nameKey="name" 
                                    cx="50%" 
                                    cy="50%" 
                                    outerRadius={70} 
                                    labelLine={false} 
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    tick={{fontSize: 10, fill: chartTextColor}}
                                >
                                    {chartDataProviders.map((entry, index) => (
                                        <RechartsCell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(value: number, name) => [`$${value.toFixed(2)}`, name]}
                                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '0.375rem' }}
                                    labelStyle={{ color: 'var(--text-primary)' }}
                                    itemStyle={{ color: 'var(--text-primary)' }}
                                />
                                <Legend wrapperStyle={{fontSize: '12px', color: chartTextColor}}/>
                            </PieChart>
                        </ResponsiveContainer>
                        ) : (<p className="text-center text-[var(--text-secondary)]">{lang === 'he' ? 'אין נתוני עלות לפי ספקים להצגה.' : 'No provider cost data to display.'}</p>)}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
