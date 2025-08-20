import React, { useState } from 'react';
import { 
  User, Shield, Bell, Palette, Brain, Database, 
  Link2, Package, Moon, Sun, Monitor, Smartphone,
  Mail, MessageSquare, Volume2, Zap, Key, Download,
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
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const Settings= () => {
  const [theme, setTheme] = useState('system');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    lowStock: true,
    orderUpdates: true,
    systemAlerts: true,
  });
  const [aiSettings, setAiSettings] = useState({
    enabled: true,
    autoSuggestions: true,
    voiceInput: false,
    contextMemory: 'session',
    responseSpeed: 'balanced',
  });
  const [syncStatus, setSyncStatus] = useState('connected');
  const [storageUsed] = useState(67);

  const handleNotificationToggle = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAIToggle = (key) => {
    setAiSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your warehouse preferences and configurations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={syncStatus === 'connected' ? 'default' : 'destructive'} className="gap-1">
              {syncStatus === 'connected' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {syncStatus === 'connected' ? 'Synced' : 'Offline'}
            </Badge>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Settings
            </Button>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-7 w-full max-w-3xl">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden lg:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="warehouse" className="gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden lg:inline">Warehouse</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Brain className="w-4 h-4" />
              <span className="hidden lg:inline">AI Assistant</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden lg:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden lg:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden lg:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-2">
              <Link2 className="w-4 h-4" />
              <span className="hidden lg:inline">Integrations</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24 border-4 border-primary/10">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button>Change Avatar</Button>
                    <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max 5MB</p>
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="john.doe@warehouse.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" defaultValue="+1 (555) 123-4567" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select defaultValue="manager">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="manager">Warehouse Manager</SelectItem>
                        <SelectItem value="operator">Operator</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Warehouse Tab */}
          <TabsContent value="warehouse" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Warehouse Configuration</CardTitle>
                <CardDescription>Manage your warehouse settings and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="warehouse-name">Warehouse Name</Label>
                    <Input id="warehouse-name" defaultValue="Main Distribution Center" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="warehouse-id">Warehouse ID</Label>
                    <Input id="warehouse-id" defaultValue="WH-001-NYC" disabled />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Location Settings
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Time Zone</Label>
                      <Select defaultValue="est">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="est">Eastern Time (EST)</SelectItem>
                          <SelectItem value="cst">Central Time (CST)</SelectItem>
                          <SelectItem value="mst">Mountain Time (MST)</SelectItem>
                          <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Temperature Unit</Label>
                      <RadioGroup defaultValue="celsius">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="celsius" id="celsius" />
                          <Label htmlFor="celsius">Celsius (°C)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="fahrenheit" id="fahrenheit" />
                          <Label htmlFor="fahrenheit">Fahrenheit (°F)</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    Inventory Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Low Stock Alert Threshold</Label>
                        <p className="text-sm text-muted-foreground">Alert when stock falls below this percentage</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Slider defaultValue={[20]} max={100} step={5} className="w-32" />
                        <span className="text-sm font-medium w-12">20%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto-reorder</Label>
                        <p className="text-sm text-muted-foreground">Automatically create purchase orders for low stock</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Storage Usage</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Used: 67GB / 100GB</span>
                      <span className="text-muted-foreground">{storageUsed}%</span>
                    </div>
                    <Progress value={storageUsed} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Assistant Tab */}
          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  AI Assistant Configuration
                </CardTitle>
                <CardDescription>Customize your AI assistant behavior and capabilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
                    <div className="space-y-0.5">
                      <Label className="text-base">Enable AI Assistant</Label>
                      <p className="text-sm text-muted-foreground">Get intelligent insights and recommendations</p>
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
                        <h3 className="text-lg font-semibold">Features</h3>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Auto Suggestions</Label>
                              <p className="text-sm text-muted-foreground">Proactive insights based on your data</p>
                            </div>
                            <Switch 
                              checked={aiSettings.autoSuggestions} 
                              onCheckedChange={() => handleAIToggle('autoSuggestions')}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Voice Input</Label>
                              <p className="text-sm text-muted-foreground">Use voice commands to interact</p>
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
                        <h3 className="text-lg font-semibold">Performance</h3>
                        
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Context Memory</Label>
                            <Select 
                              value={aiSettings.contextMemory} 
                              onValueChange={(value) => setAiSettings(prev => ({ ...prev, contextMemory: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No Memory</SelectItem>
                                <SelectItem value="session">Current Session</SelectItem>
                                <SelectItem value="persistent">Remember Everything</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Response Speed</Label>
                            <RadioGroup 
                              value={aiSettings.responseSpeed}
                              onValueChange={(value) => setAiSettings(prev => ({ ...prev, responseSpeed: value }))}
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="fast" id="fast" />
                                <Label htmlFor="fast" className="flex items-center gap-2">
                                  <Zap className="w-4 h-4" />
                                  Fast (Less accurate)
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="balanced" id="balanced" />
                                <Label htmlFor="balanced" className="flex items-center gap-2">
                                  <BarChart3 className="w-4 h-4" />
                                  Balanced
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="accurate" id="accurate" />
                                <Label htmlFor="accurate" className="flex items-center gap-2">
                                  <Brain className="w-4 h-4" />
                                  Accurate (Slower)
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="p-4 rounded-lg bg-muted/50">
                        <h4 className="font-semibold mb-2">AI Usage Statistics</h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-primary">1,247</p>
                            <p className="text-sm text-muted-foreground">Queries Today</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-green-600">94%</p>
                            <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-purple-600">2.3s</p>
                            <p className="text-sm text-muted-foreground">Avg Response</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Notification Channels</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <Label className="text-base">Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive updates via email</p>
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
                          <Label className="text-base">Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">Browser and mobile notifications</p>
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
                          <Label className="text-base">SMS Notifications</Label>
                          <p className="text-sm text-muted-foreground">Text messages for critical alerts</p>
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
                  <h3 className="text-lg font-semibold">Notification Types</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Low Stock Alerts</Label>
                        <p className="text-sm text-muted-foreground">When inventory falls below threshold</p>
                      </div>
                      <Switch 
                        checked={notifications.lowStock} 
                        onCheckedChange={() => handleNotificationToggle('lowStock')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Order Updates</Label>
                        <p className="text-sm text-muted-foreground">New orders and status changes</p>
                      </div>
                      <Switch 
                        checked={notifications.orderUpdates} 
                        onCheckedChange={() => handleNotificationToggle('orderUpdates')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>System Alerts</Label>
                        <p className="text-sm text-muted-foreground">Maintenance and system updates</p>
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
                  <h3 className="text-lg font-semibold">Quiet Hours</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Do Not Disturb</Label>
                      <p className="text-sm text-muted-foreground">Silence non-critical notifications</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Input type="time" defaultValue="22:00" className="w-24" />
                      <span>to</span>
                      <Input type="time" defaultValue="07:00" className="w-24" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>Customize the look and feel of your dashboard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Theme</h3>
                  <RadioGroup value={theme} onValueChange={setTheme}>
                    <div className="grid grid-cols-3 gap-4">
                      <Label
                        htmlFor="light"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <RadioGroupItem value="light" id="light" className="sr-only" />
                        <Sun className="mb-3 h-6 w-6" />
                        <span>Light</span>
                      </Label>
                      <Label
                        htmlFor="dark"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <RadioGroupItem value="dark" id="dark" className="sr-only" />
                        <Moon className="mb-3 h-6 w-6" />
                        <span>Dark</span>
                      </Label>
                      <Label
                        htmlFor="system"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <RadioGroupItem value="system" id="system" className="sr-only" />
                        <Monitor className="mb-3 h-6 w-6" />
                        <span>System</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Display Density</h3>
                  <RadioGroup defaultValue="comfortable">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="compact" id="compact" />
                        <Label htmlFor="compact">Compact - More information, less spacing</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="comfortable" id="comfortable" />
                        <Label htmlFor="comfortable">Comfortable - Balanced spacing</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="spacious" id="spacious" />
                        <Label htmlFor="spacious">Spacious - More breathing room</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Accent Color</h3>
                  <div className="grid grid-cols-6 gap-2">
                    {['blue', 'purple', 'green', 'orange', 'red', 'pink'].map((color) => (
                      <button
                        key={color}
                        className={`w-full h-10 rounded-md bg-${color}-500 hover:ring-2 hover:ring-offset-2 hover:ring-${color}-500 transition-all`}
                        style={{ backgroundColor: `var(--${color}-500)` }}
                      />
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Interface Options</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Show animations</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Compact sidebar</Label>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Show tooltips</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security and access</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-green-50 dark:bg-green-950/20">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">Currently enabled</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Password</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">Last changed 45 days ago</p>
                        <p className="text-sm text-muted-foreground">Use a strong, unique password</p>
                      </div>
                      <Button variant="outline">
                        <Key className="w-4 h-4 mr-2" />
                        Change Password
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Active Sessions</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Monitor className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Windows PC - Chrome</p>
                            <p className="text-sm text-muted-foreground">New York, US • Current session</p>
                          </div>
                        </div>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Smartphone className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">iPhone 14 Pro</p>
                            <p className="text-sm text-muted-foreground">Brooklyn, US • 2 hours ago</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">Revoke</Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">API Keys</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium font-mono text-sm">wh_live_k3y_****4a2b</p>
                          <p className="text-sm text-muted-foreground">Created on Jan 15, 2025</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">Regenerate</Button>
                          <Button variant="ghost" size="sm" className="text-destructive">Delete</Button>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Key className="w-4 h-4 mr-2" />
                      Create New API Key
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Third-Party Integrations</CardTitle>
                <CardDescription>Connect your warehouse with external services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { name: 'Shopify', icon: '🛍️', status: 'connected', description: 'Sync orders and inventory' },
                    { name: 'QuickBooks', icon: '📊', status: 'connected', description: 'Financial data sync' },
                    { name: 'Slack', icon: '💬', status: 'disconnected', description: 'Team notifications' },
                    { name: 'Google Sheets', icon: '📄', status: 'disconnected', description: 'Export reports' },
                    { name: 'Zapier', icon: '⚡', status: 'disconnected', description: 'Workflow automation' },
                    { name: 'Microsoft Teams', icon: '👥', status: 'disconnected', description: 'Team collaboration' },
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
                            Connected
                          </>
                        ) : (
                          <>
                            Connect
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

        {/* Save Button */}
        <div className="flex justify-end gap-4 pt-6">
          <Button variant="outline">Cancel</Button>
          <Button className="gap-2">
            <Check className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;