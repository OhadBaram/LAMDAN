
import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import parseISO from 'date-fns/parseISO'; // Corrected import
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell as RechartsCell } from 'recharts';

import { useAppContext } from '../../contexts/AppContext';
import { useUserSettings, CostManagement } from '../../contexts/UserSettingsContext';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';

export function CockpitPage() {
    const { lang, tokenUsage, apiSettings } = useAppContext();
    const { costManagement, setCostManagements } = useUserSettings();

    const [editingBudgets, setEditingBudgets] = useState(costManagement);

    useEffect(() => {
        setEditingBudgets(costManagement);
    }, [costManagement]);

    const handleBudgetChange = (field: keyof CostManagement, value: string) => {
        setEditingBudgets(prev => ({...prev, [field]: field === 'alertEmail' ? value : parseFloat(value) || 0 }));
    };
    const handleSaveBudgets = () => {
        setCostManagements(editingBudgets);
    };

    if (!tokenUsage || !apiSettings) return <Loader2 className="animate-spin m-auto"/>;

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
        .sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
        .map(item => ({ date: format(parseISO(item.date), 'MMM dd'), cost: item.cost || 0}));
    
    const dailyAggregatedCost = costOverTime.reduce((acc: {[key: string]: number}, item) => {
        acc[item.date] = (acc[item.date] || 0) + item.cost;
        return acc;
    }, {});
    const lineChartData = Object.entries(dailyAggregatedCost).map(([date, cost]) => ({ date, cost }));

    const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82Ca9D'];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>{lang === 'he' ? 'קוקפיט ניהול עלויות' : 'Cost Management Cockpit'}</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-red-50 dark:bg-red-900/30">
                        <CardHeader className="pb-2"><CardTitle className="text-sm text-red-700 dark:text-red-300">{lang === 'he' ? 'עלות כוללת (כל הזמנים)' : 'Total Cost (All Time)'}</CardTitle></CardHeader>
                        <CardContent><p className="text-2xl font-bold text-red-600 dark:text-red-400">${totalCost.toFixed(2)}</p></CardContent>
                    </Card>
                    <Card className="bg-blue-50 dark:bg-blue-900/30">
                        <CardHeader className="pb-2"><CardTitle className="text-sm text-blue-700 dark:text-blue-300">{lang === 'he' ? 'סה"כ טוקנים נכנסים' : 'Total Incoming Tokens'}</CardTitle></CardHeader>
                        <CardContent><p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalIncomingTokens.toLocaleString()}</p></CardContent>
                    </Card>
                    <Card className="bg-green-50 dark:bg-green-900/30">
                        <CardHeader className="pb-2"><CardTitle className="text-sm text-green-700 dark:text-green-300">{lang === 'he' ? 'סה"כ טוקנים יוצאים' : 'Total Outgoing Tokens'}</CardTitle></CardHeader>
                        <CardContent><p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalOutgoingTokens.toLocaleString()}</p></CardContent>
                    </Card>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>{lang === 'he' ? 'הגדרות תקציב והתראות' : 'Budget & Alert Settings'}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><Label htmlFor="dailyBudget">{lang === 'he' ? 'תקציב יומי ($)' : 'Daily Budget ($)'}</Label><Input id="dailyBudget" type="number" value={editingBudgets.dailyBudget} onChange={e => handleBudgetChange('dailyBudget', e.target.value)} /></div>
                        <div><Label htmlFor="weeklyBudget">{lang === 'he' ? 'תקציב שבועי ($)' : 'Weekly Budget ($)'}</Label><Input id="weeklyBudget" type="number" value={editingBudgets.weeklyBudget} onChange={e => handleBudgetChange('weeklyBudget', e.target.value)} /></div>
                        <div><Label htmlFor="monthlyBudget">{lang === 'he' ? 'תקציב חודשי ($)' : 'Monthly Budget ($)'}</Label><Input id="monthlyBudget" type="number" value={editingBudgets.monthlyBudget} onChange={e => handleBudgetChange('monthlyBudget', e.target.value)} /></div>
                    </div>
                     <p className="text-xs text-gray-500 dark:text-gray-400">{lang === 'he' ? 'הערה: התראות על חריגה מהתקציב יוצגו בתוך האפליקציה. שליחת מייל דורשת הגדרת שרת Backend.' : 'Note: Budget overrun alerts will be shown in-app. Email notifications require backend setup.'}</p>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSaveBudgets}>{lang === 'he' ? 'שמור הגדרות תקציב' : 'Save Budget Settings'}</Button>
                </CardFooter>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card>
                    <CardHeader><CardTitle>{lang === 'he' ? 'עלות מצטברת לאורך זמן' : 'Cumulative Cost Over Time'}</CardTitle></CardHeader>
                    <CardContent className="h-[300px]">
                        {lineChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lineChartData}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                                <XAxis dataKey="date" tick={{fontSize: 12}} />
                                <YAxis tick={{fontSize: 12}} tickFormatter={(value) => `$${value.toFixed(2)}`} />
                                <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, lang === 'he' ? 'עלות' : 'Cost']} />
                                <Legend />
                                <Line type="monotone" dataKey="cost" stroke="#8884d8" strokeWidth={2} dot={{r:3}} activeDot={{r:6}} name={lang === 'he' ? 'עלות יומית' : 'Daily Cost'}/>
                            </LineChart>
                        </ResponsiveContainer>
                        ) : (<p className="text-center text-gray-500">{lang === 'he' ? 'אין נתוני עלות להצגה.' : 'No cost data to display.'}</p>)}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>{lang === 'he' ? 'התפלגות עלויות לפי ספק' : 'Cost Distribution by Provider'}</CardTitle></CardHeader>
                    <CardContent className="h-[300px]">
                        {chartDataProviders.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={chartDataProviders} dataKey="cost" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} >
                                    {chartDataProviders.map((entry, index) => (
                                        <RechartsCell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number, name) => [`$${value.toFixed(2)}`, name]}/>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                        ) : (<p className="text-center text-gray-500">{lang === 'he' ? 'אין נתוני עלות לפי ספקים להצגה.' : 'No provider cost data to display.'}</p>)}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
