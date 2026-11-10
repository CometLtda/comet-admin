import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, Pencil, Trash2, Bell, ExternalLink } from "lucide-react";
import { apiService, BannerItem, BannerPayload } from "@/services/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import toast from "react-hot-toast";

const emptyForm: BannerPayload = {
  title: "",
  description: "",
  buttonLink: "",
  buttonText: "",
  emoji: "",
  displayOrder: 0,
};

export default function Notifications() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BannerItem | null>(null);
  const [form, setForm] = useState<BannerPayload>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<BannerItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["banners"],
    queryFn: () => apiService.getBanners(),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (banner: BannerItem) => {
    setEditing(banner);
    setForm({
      title: banner.title ?? "",
      description: banner.description ?? "",
      buttonLink: banner.buttonLink ?? "",
      buttonText: banner.buttonText ?? "",
      emoji: banner.emoji ?? "",
      displayOrder: banner.displayOrder ?? 0,
    });
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Preencha título e descrição");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await apiService.updateBanner(editing.publicId, form);
        toast.success("Notificação atualizada com sucesso!");
      } else {
        await apiService.createBanner(form);
        toast.success("Notificação criada com sucesso!");
      }
      setFormOpen(false);
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    } catch {
      // erro já notificado pelo serviço
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await apiService.deleteBanner(toDelete.publicId);
      toast.success("Notificação removida com sucesso!");
      setToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    } catch {
      // erro já notificado pelo serviço
    } finally {
      setDeleting(false);
    }
  };

  const banners = [...(data ?? [])].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Notificações</h1>
            <p className="text-muted-foreground">Gerencie os banners exibidos aos streamers</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nova notificação
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : banners.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {banners.map((banner) => (
              <Card key={banner.publicId} className="glass-strong shadow-modern">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="text-2xl leading-none">{banner.emoji}</span>
                      <div className="min-w-0">
                        <CardTitle className="text-lg truncate">{banner.title}</CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {banner.description}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">Ordem {banner.displayOrder}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {banner.buttonLink && (
                    <a
                      href={banner.buttonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline break-all"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      {banner.buttonText || banner.buttonLink}
                    </a>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-muted-foreground">
                      {banner.dateCreated
                        ? format(new Date(banner.dateCreated), "dd/MM/yyyy HH:mm", { locale: ptBR })
                        : ""}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(banner)}>
                        <Pencil className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setToDelete(banner)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Bell className="h-8 w-8 text-muted-foreground" />}
            title="Nenhuma notificação"
            description="Crie a primeira notificação para exibir aos streamers."
          />
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar notificação" : "Nova notificação"}</DialogTitle>
            <DialogDescription>
              Preencha as informações que serão exibidas no banner.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-[1fr_100px] gap-3">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emoji">Emoji</Label>
                <Input
                  id="emoji"
                  value={form.emoji}
                  onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buttonText">Texto do botão</Label>
              <Input
                id="buttonText"
                value={form.buttonText}
                onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buttonLink">Link do botão</Label>
              <Input
                id="buttonLink"
                value={form.buttonLink}
                onChange={(e) => setForm({ ...form, buttonLink: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayOrder">Ordem de exibição</Label>
              <Input
                id="displayOrder"
                type="number"
                value={form.displayOrder}
                onChange={(e) =>
                  setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir notificação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a notificação "{toDelete?.title}"? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleting}
            >
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
