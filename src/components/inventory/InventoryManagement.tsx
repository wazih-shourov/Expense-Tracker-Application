import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Package, TrendingUp, FileText } from 'lucide-react';
import InventoryDashboard from './InventoryDashboard';
import ProductsList from './ProductsList';
import ProductForm from './ProductForm';
import StockTransactions from './StockTransactions';
import InventoryReports from './InventoryReports';

type InventoryPage = 'dashboard' | 'products' | 'add-product' | 'edit-product' | 'transactions' | 'reports';

const InventoryManagement = () => {
  const [currentPage, setCurrentPage] = useState<InventoryPage>('dashboard');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setCurrentPage('add-product');
    setActiveTab('products');
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setCurrentPage('edit-product');
    setActiveTab('products');
  };

  const handleProductFormSuccess = () => {
    setCurrentPage('products');
    setSelectedProduct(null);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'dashboard') setCurrentPage('dashboard');
    else if (value === 'products') setCurrentPage('products');
    else if (value === 'transactions') setCurrentPage('transactions');
    else if (value === 'reports') setCurrentPage('reports');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <InventoryDashboard />;
      
      case 'products':
        return (
          <ProductsList 
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
          />
        );
      
      case 'add-product':
      case 'edit-product':
        return (
          <ProductForm
            product={selectedProduct}
            onBack={() => setCurrentPage('products')}
            onSuccess={handleProductFormSuccess}
          />
        );
      
      case 'transactions':
        return <StockTransactions />;
      
      case 'reports':
        return <InventoryReports />;
      
      default:
        return <InventoryDashboard />;
    }
  };

  // Show form pages without tabs
  if (currentPage === 'add-product' || currentPage === 'edit-product') {
    return (
      <div className="container mx-auto p-4 md:p-6">
        {renderPage()}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Inventory Management</h1>
        <p className="text-muted-foreground">Manage your products, track stock, and view reports</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Products</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Transactions</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Reports</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <InventoryDashboard />
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <ProductsList 
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
          />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <StockTransactions />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <InventoryReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryManagement;