import React, { useEffect, useState } from 'react';
import {
  User, Shield, Bell, Palette, Brain, Database,
  Link2, Package, Moon, Sun, Monitor, Smartphone,
  Mail, MessageSquare, Zap, Key, Download,
  Upload, Globe, Wifi, WifiOff, Check, ChevronRight,
  Building2, MapPin, BarChart3, Lock, Sparkles
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {useUIStore} from "@/stores";

const Settings = () => {
   const { 
    theme: globalTheme, 
    setTheme: setGlobalTheme, 
    sidebarOpen, 
    toggleSidebar, 
    aiSettings, 
    setAISettings 
  } = useUIStore();
  
  // 保持本地状态，但确保与全局状态同步
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>(
    globalTheme
  );
  
  interface Notifications {
    email: boolean;
    push: boolean;
    sms: boolean;
    lowStock: boolean;
    orderUpdates: boolean;
    systemAlerts: boolean;
  }
  interface SettingsData {
    theme: 'system' | 'light' | 'dark';
    notifications: Notifications;
    aiSettings: typeof aiSettings;
    lowStockThreshold: number;
    autoReorder: boolean;
    avatarUrl: string;
    showAnimations: boolean;
    compactSidebar: boolean;
    showTooltips: boolean;
  }

  // 通知
  const [notifications, setNotifications] = useState<Notifications>({
    email: true,
    push: true,
    sms: false,
    lowStock: true,
    orderUpdates: true,
    systemAlerts: true,
  });
  // 同步状态
  const [syncStatus, setSyncStatus] = useState<'connected' | 'disconnected'>('connected');
  // 库存告警阈值（滑块展示联动）
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(20);
  const [autoReorder, setAutoReorder] = useState<boolean>(false);
  // 头像上传预览
  const [avatarUrl, setAvatarUrl] = useState<string>('https://github.com/shadcn.png');
  // 保存成功提示
 // 界面选项
const [showAnimations, setShowAnimations] = useState<boolean>(true);
  
  const [compactSidebar, setCompactSidebar] = useState<boolean>(false);
  
  const [showTooltips, setShowTooltips] = useState<boolean>(true);
  // 保存/取消提示
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });
  const [savedSettings, setSavedSettings] = useState<SettingsData | null>(null);
  // 主题切换副作用：将 dark 类应用到 html 上；System 模式监听 OS 变化
  useEffect(() => {
    const root = document.documentElement;
    const apply = (mode: 'light' | 'dark') => {
      if (mode === 'dark') root.classList.add('dark');
      else root.classList.remove('dark');
    };


    if (theme === 'system') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      apply(mql.matches ? 'dark' : 'light');
      const handler = (e: MediaQueryListEvent) => apply(e.matches ? 'dark' : 'light');
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    } else {
      apply(theme);
    }
  }, [theme]);
  
  // 当全局主题变化时（例如通过persist中间件恢复），更新本地状态
  useEffect(() => {
    setTheme(globalTheme);
  }, [globalTheme]);
  
  // Auto-save settings when they change
useEffect(() => {
  const timer = setTimeout(() => {
    const currentSettings = {
      theme,
      notifications,
      aiSettings,
      lowStockThreshold,
      autoReorder,
      avatarUrl,
      showAnimations,
      compactSidebar,
      showTooltips,
    };
    setSavedSettings(currentSettings);
  }, 500); // 500ms debounce

  return () => clearTimeout(timer);
}, [theme, notifications, aiSettings, lowStockThreshold, autoReorder, avatarUrl, showAnimations, compactSidebar, showTooltips]);

  useEffect(() => {
    document.body.classList.toggle('no-animations', !showAnimations);
  }, [showAnimations]);

  useEffect(() => {
    document.body.classList.toggle('no-tooltips', !showTooltips);
  }, [showTooltips]);

  useEffect(() => {
    if (compactSidebar !== !sidebarOpen) toggleSidebar();
  }, [compactSidebar, sidebarOpen, toggleSidebar]);

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAIToggle = (key: keyof typeof aiSettings) => {
    const newSettings = { ...aiSettings, [key]: !aiSettings[key] };
    setAISettings(newSettings);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // 简单大小限制示例（5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  const handleSave = () => {
    // 此处可提交设置到后端
    const data: SettingsData = {
      theme,
      notifications,
      aiSettings,
      lowStockThreshold,
      autoReorder,
      avatarUrl,
      showAnimations,
      compactSidebar,
      showTooltips,
    };
    setSavedSettings(data);
    const desiredTheme = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    setGlobalTheme(desiredTheme);
    setToast({ visible: true, message: '设置已保存' });
    setTimeout(() => setToast({ visible: false, message: '' }), 2000);
  };

  const handleCancel = () => {
    if (savedSettings) {
      setTheme(savedSettings.theme);
      setNotifications(savedSettings.notifications);
      setLowStockThreshold(savedSettings.lowStockThreshold);
      setAutoReorder(savedSettings.autoReorder);
      setAvatarUrl(savedSettings.avatarUrl);
      setShowAnimations(savedSettings.showAnimations);
      setCompactSidebar(savedSettings.compactSidebar);
      setShowTooltips(savedSettings.showTooltips);
    }
    setToast({ visible: true, message: '已放弃更改并恢复到上次保存' });
    setTimeout(() => setToast({ visible: false, message: '' }), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 头部 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              设置
            </h1>
            <p className="text-muted-foreground mt-1">
              管理仓库策略、界面偏好与智能服务
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={syncStatus === 'connected' ? 'default' : 'destructive'} className="gap-1">
              {syncStatus === 'connected' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {syncStatus === 'connected' ? '已同步' : '离线'}
            </Badge>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              导出设置
            </Button>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-7 w-full max-w-3xl">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden lg:inline">个人资料</span>
            </TabsTrigger>
            <TabsTrigger value="warehouse" className="gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden lg:inline">仓库</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Brain className="w-4 h-4" />
              <span className="hidden lg:inline">AI 助手</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden lg:inline">通知</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden lg:inline">外观</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden lg:inline">安全</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-2">
              <Link2 className="w-4 h-4" />
              <span className="hidden lg:inline">集成</span>
            </TabsTrigger>
          </TabsList>

          {/* 个人资料 */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>个人信息</CardTitle>
                <CardDescription>更新你的基本信息与偏好</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24 border-4 border-primary/10">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Input id="avatar-upload" type="file" accept="image/png,image/jpeg,image/gif" onChange={handleAvatarChange} className="max-w-xs" />
                      <span className="text-sm text-muted-foreground">支持 PNG / JPG / GIF，最大 5MB</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">姓名</Label>
                    <Input id="name" defaultValue="张仓管" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱</Label>
                    <Input id="email" type="email" defaultValue="zhangcg@warehouse.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">电话</Label>
                    <Input id="phone" defaultValue="138-0000-0000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">角色</Label>
                    <Select defaultValue="manager">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">管理员</SelectItem>
                        <SelectItem value="manager">仓库经理</SelectItem>
                        <SelectItem value="operator">操作员</SelectItem>
                        <SelectItem value="viewer">只读</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 仓库设置 */}
          <TabsContent value="warehouse" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>仓库配置</CardTitle>
                <CardDescription>管理仓库基础参数与偏好</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="warehouse-name">仓库名称</Label>
                    <Input id="warehouse-name" defaultValue="主配送中心" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="warehouse-id">仓库 ID</Label>
                    <Input id="warehouse-id" defaultValue="WH-001-SH" disabled />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    位置与时区
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>时区</Label>
                      <Select defaultValue="est">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="est">北美东部时间（EST）</SelectItem>
                          <SelectItem value="cst">北美中部时间（CST）</SelectItem>
                          <SelectItem value="mst">北美山地时间（MST）</SelectItem>
                          <SelectItem value="pst">北美太平洋时间（PST）</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>温度单位</Label>
                      <RadioGroup defaultValue="celsius">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="celsius" id="celsius" />
                          <Label htmlFor="celsius">摄氏（°C）</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="fahrenheit" id="fahrenheit" />
                          <Label htmlFor="fahrenheit">华氏（°F）</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    库存策略
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>低库存告警阈值</Label>
                        <p className="text-sm text-muted-foreground">当库存低于该百分比时提醒</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Slider value={[lowStockThreshold]} max={100} step={5} className="w-32" onValueChange={(v) => setLowStockThreshold(v[0])} />
                        <span className="text-sm font-medium w-12 text-right">{lowStockThreshold}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 按需求删除“存储用量”板块 */}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI 助手 */}
          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  AI 助手配置
                </CardTitle>
                <CardDescription>自定义 AI 助手的行为与能力</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
                    <div className="space-y-0.5">
                      <Label className="text-base">启用 AI 助手</Label>
                      <p className="text-sm text-muted-foreground">获取智能洞察与建议</p>
                    </div>
                    <Switch
                      checked={aiSettings.enabled}
                      onCheckedChange={() => handleAIToggle('enabled')}
                    />
                  </div>

                  {aiSettings.enabled && (
                    <>
                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">功能</h3>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>自动建议</Label>
                              <p className="text-sm text-muted-foreground">基于你的数据主动给出洞察</p>
                            </div>
                            <Switch
                              checked={aiSettings.autoSuggestions}
                              onCheckedChange={() => handleAIToggle('autoSuggestions')}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>语音输入</Label>
                              <p className="text-sm text-muted-foreground">使用语音与系统交互</p>
                            </div>
                            <Switch
                              checked={aiSettings.voiceInput}
                              onCheckedChange={() => handleAIToggle('voiceInput')}
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">性能</h3>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>上下文记忆</Label>
                            <Select
                              value={aiSettings.contextMemory as 'none' | 'session' | 'persistent'}
                              onValueChange={(value) => setAISettings({ ...aiSettings, contextMemory: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">不记忆</SelectItem>
                                <SelectItem value="session">仅当前会话</SelectItem>
                                <SelectItem value="persistent">长期记忆</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>响应速度</Label>
                            <RadioGroup
                              value={aiSettings.responseSpeed as 'fast' | 'balanced' | 'accurate'}
                              onValueChange={(value) => setAISettings({ ...aiSettings, responseSpeed: value })}
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="fast" id="fast" />
                                <Label htmlFor="fast" className="flex items-center gap-2">
                                  <Zap className="w-4 h-4" />
                                  快速（准确度略低）
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="balanced" id="balanced" />
                                <Label htmlFor="balanced" className="flex items-center gap-2">
                                  <BarChart3 className="w-4 h-4" />
                                  平衡
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="accurate" id="accurate" />
                                <Label htmlFor="accurate" className="flex items-center gap-2">
                                  <Brain className="w-4 h-4" />
                                  准确（速度较慢）
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="p-4 rounded-lg bg-muted/50">
                        <h4 className="font-semibold mb-2">AI 使用统计</h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-primary">1,247</p>
                            <p className="text-sm text-muted-foreground">今日查询</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-green-600">94%</p>
                            <p className="text-sm text-muted-foreground">准确率</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-purple-600">2.3s</p>
                            <p className="text-sm text-muted-foreground">平均响应</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 通知 */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>通知偏好</CardTitle>
                <CardDescription>选择你的通知方式与类型</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">通知渠道</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <Label className="text-base">邮箱</Label>
                          <p className="text-sm text-muted-foreground">通过电子邮件接收更新</p>
                        </div>
                      </div>
                      <Switch
                        checked={notifications.email}
                        onCheckedChange={() => handleNotificationToggle('email')}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <Label className="text-base">推送</Label>
                          <p className="text-sm text-muted-foreground">浏览器与移动端推送通知</p>
                        </div>
                      </div>
                      <Switch
                        checked={notifications.push}
                        onCheckedChange={() => handleNotificationToggle('push')}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <Label className="text-base">短信</Label>
                          <p className="text-sm text-muted-foreground">为关键告警发送短信</p>
                        </div>
                      </div>
                      <Switch
                        checked={notifications.sms}
                        onCheckedChange={() => handleNotificationToggle('sms')}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">通知类型</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>低库存告警</Label>
                        <p className="text-sm text-muted-foreground">当库存低于阈值时</p>
                      </div>
                      <Switch
                        checked={notifications.lowStock}
                        onCheckedChange={() => handleNotificationToggle('lowStock')}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>订单更新</Label>
                        <p className="text-sm text-muted-foreground">新订单与状态变更</p>
                      </div>
                      <Switch
                        checked={notifications.orderUpdates}
                        onCheckedChange={() => handleNotificationToggle('orderUpdates')}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>系统告警</Label>
                        <p className="text-sm text-muted-foreground">维护与系统更新</p>
                      </div>
                      <Switch
                        checked={notifications.systemAlerts}
                        onCheckedChange={() => handleNotificationToggle('systemAlerts')}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">免打扰</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>请勿打扰</Label>
                      <p className="text-sm text-muted-foreground">静音非关键通知</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Input type="time" defaultValue="22:00" className="w-24" />
                      <span>至</span>
                      <Input type="time" defaultValue="07:00" className="w-24" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 外观 */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>外观设置</CardTitle>
                <CardDescription>自定义仪表盘的外观与风格</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">主题</h3>
                  <RadioGroup value={theme} onValueChange={(v) => setTheme(v as 'system' | 'light' | 'dark')}>
                    <div className="grid grid-cols-3 gap-4">
                      <Label
                        htmlFor="light"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <RadioGroupItem value="light" id="light" className="sr-only" />
                        <Sun className="mb-3 h-6 w-6" />
                        <span>浅色</span>
                      </Label>
                      <Label
                        htmlFor="dark"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <RadioGroupItem value="dark" id="dark" className="sr-only" />
                        <Moon className="mb-3 h-6 w-6" />
                        <span>深色</span>
                      </Label>
                      <Label
                        htmlFor="system"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <RadioGroupItem value="system" id="system" className="sr-only" />
                        <Monitor className="mb-3 h-6 w-6" />
                        <span>跟随系统</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                {/* 删除 Display Density 模块 */}

                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">界面选项</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>显示动效</Label>
                      <Switch checked={showAnimations} onCheckedChange={setShowAnimations} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>紧凑侧边栏</Label>
                      <Switch checked={compactSidebar} onCheckedChange={setCompactSidebar} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>显示工具提示</Label>
                       <Switch checked={showTooltips} onCheckedChange={setShowTooltips} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 安全 */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>安全设置</CardTitle>
                <CardDescription>管理账户安全与访问</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-green-50 dark:bg-green-950/20">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">两步验证</p>
                        <p className="text-sm text-muted-foreground">当前已启用</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">管理</Button>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">密码</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">45 天前更新</p>
                        <p className="text-sm text-muted-foreground">请使用强且唯一的密码</p>
                      </div>
                      <Button variant="outline">
                        <Key className="w-4 h-4 mr-2" />
                        修改密码
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">活跃会话</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Monitor className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Windows 台式机 - Chrome</p>
                            <p className="text-sm text-muted-foreground">美国纽约 • 当前会话</p>
                          </div>
                        </div>
                        <Badge variant="secondary">活动中</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Smartphone className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">iPhone 14 Pro</p>
                            <p className="text-sm text-muted-foreground">美国布鲁克林 • 2 小时前</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">远程登出</Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">API 密钥</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div> {/* 实际开发需要在这里调用api */}
                          <p className="font-medium font-mono text-sm">wh_live_k3y_****4a2b</p>
                          <p className="text-sm text-muted-foreground">创建于 2025-01-15</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">重新生成</Button>
                          <Button variant="ghost" size="sm" className="text-destructive">删除</Button>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Key className="w-4 h-4 mr-2" />
                      创建新的 API 密钥
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 集成 */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>第三方集成</CardTitle>
                <CardDescription>将仓库系统与外部服务打通</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { name: 'Shopify 店铺', icon: '🛍️', status: 'connected', description: '同步在线订单与库存' },
                    { name: 'QuickBooks 财务', icon: '📊', status: 'connected', description: '推送财务数据到会计系统' },
                    { name: 'Slack 团队', icon: '💬', status: 'disconnected', description: '向频道发送仓库播报' },
                    { name: 'Google 表格', icon: '📄', status: 'disconnected', description: '导出报表到共享表格' },
                    { name: 'Zapier 自动化', icon: '⚡', status: 'disconnected', description: '自定义跨系统工作流' },
                    { name: 'Microsoft Teams 协作', icon: '👥', status: 'disconnected', description: '推送通知给值班团队' },
                  ].map((integration) => (
                    <div key={integration.name} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{integration.icon}</div>
                        <div>
                          <p className="font-medium">{integration.name}</p>
                          <p className="text-sm text-muted-foreground">{integration.description}</p>
                        </div>
                      </div>
                      <Button
                        variant={integration.status === 'connected' ? 'secondary' : 'outline'}
                        size="sm"
                        className="gap-1"
                      >
                        {integration.status === 'connected' ? (
                          <>
                            <Check className="w-3 h-3" />
                            已连接
                          </>
                        ) : (
                          <>
                            连接
                            <ChevronRight className="w-3 h-3" />
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 底部操作区 */}
        <div className="flex justify-end gap-4 pt-6">
           <Button variant="outline" onClick={handleCancel}>取消</Button>
          <Button className="gap-2" onClick={handleSave}>
            <Check className="w-4 h-4" />
            保存更改
          </Button>
        </div>
      </div>

      {/* 简易 Toast 通知 */}
      {toast.visible && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="rounded-md bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-lg px-4 py-3">
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
