import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { CONFIG } from "@/config/constants";
import { apiService, LoginResponse } from "@/services/api";
import toast from "react-hot-toast";
import cryptoBg from "@/assets/crypto-bg.jpg";
import { useTheme } from "@/hooks/useTheme";
import { Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { REGEXP_ONLY_DIGITS } from "input-otp";

const PENDING_SETUP_KEY = "comet.pendingAuthenticatorSetup";

interface PendingAuthenticatorSetup {
  email: string;
  authenticatorUri: string;
  manualEntrySecret: string;
}

const readPendingSetup = (): PendingAuthenticatorSetup | null => {
  const stored = localStorage.getItem(PENDING_SETUP_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as PendingAuthenticatorSetup;
    return parsed.authenticatorUri && parsed.email ? parsed : null;
  } catch {
    localStorage.removeItem(PENDING_SETUP_KEY);
    return null;
  }
};

const Login = () => {
  const [pendingSetup, setPendingSetup] = useState<PendingAuthenticatorSetup | null>(readPendingSetup);
  const [email, setEmail] = useState(() => readPendingSetup()?.email ?? "");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(Boolean(pendingSetup));
  const [otpCode, setOtpCode] = useState("");
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (!showAuthModal) return;

    const preventLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const keepCurrentPage = () => window.history.pushState(null, "", window.location.href);

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("beforeunload", preventLeaving);
    window.addEventListener("popstate", keepCurrentPage);
    return () => {
      window.removeEventListener("beforeunload", preventLeaving);
      window.removeEventListener("popstate", keepCurrentPage);
    };
  }, [showAuthModal]);

  const completeLoginOrSaveSetup = (response: LoginResponse): boolean => {
    if (response.token) {
      localStorage.removeItem(PENDING_SETUP_KEY);
      localStorage.setItem("user", JSON.stringify(response));
      setPendingSetup(null);
      setShowAuthModal(false);
      setOtpCode("");
      setPassword("");
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
      return true;
    }

    const authenticatorUri = response.authenticatorUri ?? response.twoFactorAutenticationSetup ?? "";
    if (authenticatorUri) {
      const setup: PendingAuthenticatorSetup = {
        email,
        authenticatorUri,
        manualEntrySecret: response.manualEntrySecret ?? "",
      };
      localStorage.setItem(PENDING_SETUP_KEY, JSON.stringify(setup));
      setPendingSetup(setup);
      setOtpCode("");
      setShowAuthModal(true);
      return false;
    }

    throw new Error("O login não retornou um token de acesso nem os dados de configuração do autenticador.");
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const response = await apiService.login({ email, password });
      completeLoginOrSaveSetup(response);
    } catch (error: any) {
      const message = error.message?.toLowerCase() ?? "";
      if (message.includes("two-factor code is required") || message.includes("2fa")) {
        setOtpCode("");
        setShowAuthModal(true);
      } else {
        toast.error("Credenciais inválidas");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitCode = async (code: string = otpCode) => {
    if (code.length !== 6 || isSubmittingCode) return;
    const loginEmail = pendingSetup?.email ?? email;
    if (!password) {
      toast.error("Digite sua senha para confirmar o código.");
      return;
    }

    setIsSubmittingCode(true);
    try {
      const response = await apiService.login({ email: loginEmail, password, twoFactorCode: code });
      completeLoginOrSaveSetup(response);
    } catch {
      toast.error("Código inválido ou login não confirmado. Tente novamente.");
      setOtpCode("");
    } finally {
      setIsSubmittingCode(false);
    }
  };

  const isEnrollment = Boolean(pendingSetup);

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-background to-muted">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              {theme === "dark" ? <img src="/comet-wordmark.png" alt={CONFIG.PLATFORM_NAME} className="h-12 w-auto" /> :
                <div className="flex items-center gap-3 text-3xl font-bold tracking-tight text-foreground"><img src="/comet-symbol.png" alt="" className="h-12 w-12" />{CONFIG.PLATFORM_NAME}</div>}
            </div>
            <p className="text-muted-foreground mt-2">Acesse sua dashboard administrativa</p>
          </div>

          <Card className="border-primary/20 shadow-[var(--shadow-glow)]">
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Entre com suas credenciais para acessar o sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={event => setEmail(event.target.value)} required className="border-primary/20 focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" type="password" value={password} onChange={event => setPassword(event.target.value)} required className="border-primary/20 focus:ring-primary" />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-[var(--shadow-glow)] transition-all duration-300 hover:shadow-[var(--shadow-intense)]" disabled={isLoading || showAuthModal}>
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <img src={cryptoBg} alt="Comet Admin" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-l from-background/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Dashboard <span className="text-primary">Administrativa</span></h2>
            <p className="text-xl opacity-90">Controle total dos seus dados em tempo real</p>
          </div>
        </div>
      </div>

      <Dialog open={showAuthModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-lg" onEscapeKeyDown={event => event.preventDefault()} onPointerDownOutside={event => event.preventDefault()} onInteractOutside={event => event.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{isEnrollment ? "Configure o Google Authenticator" : "Autenticação de dois fatores"}</DialogTitle>
            <DialogDescription>
              {isEnrollment ? "Escaneie o QR Code ou informe a chave manual no Google Authenticator. Depois, digite o código atual para concluir o login." : "Digite o código atual de 6 dígitos do seu aplicativo autenticador para entrar."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-5 py-3">
            {isEnrollment && pendingSetup && <>
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <QRCodeSVG value={pendingSetup.authenticatorUri} size={200} />
              </div>
              {pendingSetup.manualEntrySecret && <div className="w-full space-y-1 text-center">
                <Label>Chave de configuração manual</Label>
                <code className="block rounded bg-muted p-2 text-sm break-all select-all">{pendingSetup.manualEntrySecret}</code>
              </div>}
            </>}

            {!password && <div className="w-full space-y-2">
              <Label htmlFor="reauth-password">Senha da conta</Label>
              <Input id="reauth-password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} autoFocus />
              <p className="text-xs text-muted-foreground">A senha é solicitada novamente após atualizar a página e não é salva no navegador.</p>
            </div>}

            <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} value={otpCode} onChange={setOtpCode} onComplete={code => handleSubmitCode(code)} disabled={isSubmittingCode}>
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map(index => <InputOTPSlot key={index} index={index} />)}
              </InputOTPGroup>
            </InputOTP>

            <Button onClick={() => handleSubmitCode()} disabled={otpCode.length !== 6 || isSubmittingCode || !password} className="w-full">
              {isSubmittingCode ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Validando código...</> : "Confirmar código e entrar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
