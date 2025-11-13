import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { apiService, ProductCreateRequest } from '@/services/api';

export const CreateProductDialog = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { canEdit } = usePermissions();

  // 表单状态
  const [formData, setFormData] = useState<ProductCreateRequest>({
    name: '',
    sku: '',
    description: '',
    part_number: '',
    engine_model: '',
    manufacturer: 'Cummins',
    category_id: 0,
    price: 0,
    cost: 0,
    unit: 'pcs',
    min_stock_level: 10,
    image_url: '',
    is_active: true,
  });

  // 获取产品分类列表
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiService.getProductCategories(),
  });

  // 创建产品 mutation
  const createMutation = useMutation({
    mutationFn: (data: ProductCreateRequest) => apiService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: '创建成功',
        description: '产品已成功创建',
      });
      setOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: '创建失败',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      description: '',
      part_number: '',
      engine_model: '',
      manufacturer: 'Cummins',
      category_id: 0,
      price: 0,
      cost: 0,
      unit: 'pcs',
      min_stock_level: 10,
      image_url: '',
      is_active: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 验证必填字段
    if (!formData.name || !formData.sku || !formData.category_id || formData.price <= 0) {
      toast({
        title: '验证失败',
        description: '请填写所有必填字段',
        variant: 'destructive',
      });
      return;
    }

    createMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof ProductCreateRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 如果没有编辑权限，不显示按钮
  if (!canEdit) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          新增产品
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>新增产品</DialogTitle>
            <DialogDescription>
              创建新的产品信息。带 * 的字段为必填项。
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* 基础信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  产品名称 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="输入产品名称"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">
                  SKU <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  placeholder="如: ENG-6BT59-001"
                  required
                />
              </div>
            </div>

            {/* Cummins 特定字段 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="part_number">Cummins 零件号</Label>
                <Input
                  id="part_number"
                  value={formData.part_number}
                  onChange={(e) => handleInputChange('part_number', e.target.value)}
                  placeholder="如: 6BT5.9-C120"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="engine_model">适用发动机型号</Label>
                <Input
                  id="engine_model"
                  value={formData.engine_model}
                  onChange={(e) => handleInputChange('engine_model', e.target.value)}
                  placeholder="如: 6BT5.9"
                />
              </div>
            </div>

            {/* 分类和制造商 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category_id">
                  产品分类 <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.category_id ? formData.category_id.toString() : ''}
                  onValueChange={(value) => handleInputChange('category_id', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择产品分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesLoading ? (
                      <SelectItem value="loading" disabled>
                        加载中...
                      </SelectItem>
                    ) : (
                      categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {formData.category_id > 0 && categories && (
                  <p className="text-sm text-muted-foreground">
                    {categories.find((c) => c.id === formData.category_id)?.description}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="manufacturer">制造商</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                />
              </div>
            </div>

            {/* 价格信息 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">
                  售价 (¥) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price || ''}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost">成本 (¥)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost || ''}
                  onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">单位</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => handleInputChange('unit', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pcs">件 (pcs)</SelectItem>
                    <SelectItem value="box">箱 (box)</SelectItem>
                    <SelectItem value="liter">升 (liter)</SelectItem>
                    <SelectItem value="kg">千克 (kg)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 库存管理 */}
            <div className="space-y-2">
              <Label htmlFor="min_stock_level">最低库存预警线</Label>
              <Input
                id="min_stock_level"
                type="number"
                min="0"
                value={formData.min_stock_level}
                onChange={(e) => handleInputChange('min_stock_level', parseInt(e.target.value) || 10)}
              />
            </div>

            {/* 图片URL */}
            <div className="space-y-2">
              <Label htmlFor="image_url">产品图片URL</Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => handleInputChange('image_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* 描述 */}
            <div className="space-y-2">
              <Label htmlFor="description">产品描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="输入产品详细描述..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
            >
              取消
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              创建产品
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
