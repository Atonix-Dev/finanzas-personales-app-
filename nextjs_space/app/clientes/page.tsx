'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Building2, User, MoreHorizontal, Pencil, Trash2, Mail, Phone, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n/context';

interface Client {
  id: string;
  name: string;
  type: 'particular' | 'empresa';
  tax_id: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string;
  notes: string | null;
  created_at: string;
  _count?: {
    projects: number;
    invoices: number;
  };
}

const emptyClient: Partial<Client> = {
  name: '',
  type: 'particular',
  tax_id: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postal_code: '',
  country: 'España',
  notes: '',
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Partial<Client>>(emptyClient);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { t } = useI18n();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (!response.ok) throw new Error('Error fetching clients');
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: t.common.error,
        description: t.clients.fetchError,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentClient.name?.trim()) {
      toast({
        title: t.common.error,
        description: t.clients.nameRequired,
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const url = isEditing ? `/api/clients/${currentClient.id}` : '/api/clients';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentClient),
      });

      if (!response.ok) throw new Error('Error saving client');

      toast({
        title: t.common.success,
        description: isEditing ? t.clients.updated : t.clients.created,
      });

      setIsDialogOpen(false);
      setCurrentClient(emptyClient);
      setIsEditing(false);
      fetchClients();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: t.common.error,
        description: t.clients.saveError,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (client: Client) => {
    setCurrentClient(client);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!clientToDelete) return;

    try {
      const response = await fetch(`/api/clients/${clientToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error deleting client');
      }

      toast({
        title: t.common.success,
        description: t.clients.deleted,
      });

      setIsDeleteDialogOpen(false);
      setClientToDelete(null);
      fetchClients();
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: t.common.error,
        description: error.message || t.clients.deleteError,
        variant: 'destructive',
      });
    }
  };

  const openNewClientDialog = () => {
    setCurrentClient(emptyClient);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const confirmDelete = (client: Client) => {
    setClientToDelete(client);
    setIsDeleteDialogOpen(true);
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.tax_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t.clients.title}</h1>
          <p className="text-muted-foreground">{t.clients.subtitle}</p>
        </div>
        <Button onClick={openNewClientDialog}>
          <Plus className="mr-2 h-4 w-4" />
          {t.clients.newClient}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.clients.totalClients}</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.clients.individuals}</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.filter((c) => c.type === 'particular').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.clients.companies}</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.filter((c) => c.type === 'empresa').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.clients.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <User className="h-8 w-8 mb-2" />
              <p>{searchTerm ? t.clients.noResults : t.clients.noClients}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.clients.name}</TableHead>
                  <TableHead>{t.clients.type}</TableHead>
                  <TableHead>{t.clients.taxId}</TableHead>
                  <TableHead>{t.clients.contact}</TableHead>
                  <TableHead>{t.clients.projects}</TableHead>
                  <TableHead>{t.clients.invoices}</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>
                      <Badge variant={client.type === 'empresa' ? 'default' : 'secondary'}>
                        {client.type === 'empresa' ? t.clients.company : t.clients.individual}
                      </Badge>
                    </TableCell>
                    <TableCell>{client.tax_id || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {client.email && (
                          <span className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {client.email}
                          </span>
                        )}
                        {client.phone && (
                          <span className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {client.phone}
                          </span>
                        )}
                        {!client.email && !client.phone && '-'}
                      </div>
                    </TableCell>
                    <TableCell>{client._count?.projects || 0}</TableCell>
                    <TableCell>{client._count?.invoices || 0}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(client)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            {t.common.edit}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => confirmDelete(client)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t.common.delete}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? t.clients.editClient : t.clients.newClient}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? t.clients.editDescription : t.clients.createDescription}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t.clients.name} *</Label>
                <Input
                  id="name"
                  value={currentClient.name || ''}
                  onChange={(e) =>
                    setCurrentClient({ ...currentClient, name: e.target.value })
                  }
                  placeholder={t.clients.namePlaceholder}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">{t.clients.type}</Label>
                <Select
                  value={currentClient.type || 'particular'}
                  onValueChange={(value: 'particular' | 'empresa') =>
                    setCurrentClient({ ...currentClient, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="particular">{t.clients.individual}</SelectItem>
                    <SelectItem value="empresa">{t.clients.company}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tax_id">{t.clients.taxId}</Label>
                <Input
                  id="tax_id"
                  value={currentClient.tax_id || ''}
                  onChange={(e) =>
                    setCurrentClient({ ...currentClient, tax_id: e.target.value })
                  }
                  placeholder={t.clients.taxIdPlaceholder}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t.clients.email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={currentClient.email || ''}
                  onChange={(e) =>
                    setCurrentClient({ ...currentClient, email: e.target.value })
                  }
                  placeholder={t.clients.emailPlaceholder}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">{t.clients.phone}</Label>
                <Input
                  id="phone"
                  value={currentClient.phone || ''}
                  onChange={(e) =>
                    setCurrentClient({ ...currentClient, phone: e.target.value })
                  }
                  placeholder={t.clients.phonePlaceholder}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">{t.clients.country}</Label>
                <Input
                  id="country"
                  value={currentClient.country || 'España'}
                  onChange={(e) =>
                    setCurrentClient({ ...currentClient, country: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">{t.clients.address}</Label>
              <Input
                id="address"
                value={currentClient.address || ''}
                onChange={(e) =>
                  setCurrentClient({ ...currentClient, address: e.target.value })
                }
                placeholder={t.clients.addressPlaceholder}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">{t.clients.city}</Label>
                <Input
                  id="city"
                  value={currentClient.city || ''}
                  onChange={(e) =>
                    setCurrentClient({ ...currentClient, city: e.target.value })
                  }
                  placeholder={t.clients.cityPlaceholder}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal_code">{t.clients.postalCode}</Label>
                <Input
                  id="postal_code"
                  value={currentClient.postal_code || ''}
                  onChange={(e) =>
                    setCurrentClient({ ...currentClient, postal_code: e.target.value })
                  }
                  placeholder={t.clients.postalCodePlaceholder}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t.clients.notes}</Label>
              <Textarea
                id="notes"
                value={currentClient.notes || ''}
                onChange={(e) =>
                  setCurrentClient({ ...currentClient, notes: e.target.value })
                }
                placeholder={t.clients.notesPlaceholder}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? t.common.saving : isEditing ? t.common.save : t.common.create}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.clients.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.clients.deleteDescription.replace('{name}', clientToDelete?.name || '')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
