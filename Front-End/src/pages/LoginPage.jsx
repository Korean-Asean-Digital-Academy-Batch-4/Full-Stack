import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, IdCard, LockKeyhole } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import AuthCard from "../components/auth/AuthCard";
import FormInput from "../components/auth/FormInput";
import LoginErrorMessage from "../components/auth/LoginErrorMessage";
import Button from "../components/ui/Button";
import { login } from "../services/authService";
import { setAuthSession } from "../stores/authStore";

const loginSchema = z.object({
  username: z.string().trim().min(1, "Username wajib diisi."),
  password: z
    .string()
    .min(1, "Kata sandi wajib diisi."),
});

const AUTH_ERROR_MESSAGE =
  "Username/password salah.";

const dashboardByRole = {
  admin: "/superadmin/dashboard",
  teacher: "/teacher/dashboard",
  student: "/student/dashboard",
};

const routePrefixByRole = {
  admin: "/superadmin/",
  teacher: "/teacher/",
  student: "/student/",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const passwordRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: { username: "", password: "" },
  });

  const clearAuthError = () => {
    if (authError) setAuthError("");
  };

  const passwordRegistration = register("password", { onChange: clearAuthError });

  const onSubmit = async (values) => {
    setAuthError("");
    try {
      const session = await login(values);
      setAuthSession(session.user, session.token);
      const fallback = dashboardByRole[session.user.role] || "/login";
      const requestedPath = location.state?.from;
      const safeRequestedPath = requestedPath?.startsWith(routePrefixByRole[session.user.role])
        ? requestedPath
        : null;
      navigate(safeRequestedPath || fallback, { replace: true });
    } catch (error) {
      setAuthError(error.message || AUTH_ERROR_MESSAGE);
      requestAnimationFrame(() => passwordRef.current?.focus());
    }
  };

  return (
    <AuthCard
      title="Selamat Datang"
      description="Silakan login dengan menggunakan akses yang telah diberikan oleh tim IT sekolah"
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-[18px]">
        <FormInput
          id="username"
          label="NIP / NIS / Email Administrator"
          icon={IdCard}
          type="text"
          autoComplete="username"
          placeholder="123456"
          disabled={isSubmitting}
          error={errors.username?.message}
          register={register("username", { onChange: clearAuthError })}
        />

        <FormInput
          id="password"
          label="Kata Sandi"
          labelAction={
            <Link to="/forgot-password" className="text-[13px] font-medium text-[#0756D9] hover:underline">
              Lupa Password?
            </Link>
          }
          icon={LockKeyhole}
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Masukkan kata sandi"
          disabled={isSubmitting}
          error={errors.password?.message}
          register={{
            ...passwordRegistration,
            ref: (element) => {
              passwordRegistration.ref(element);
              passwordRef.current = element;
            },
          }}
          endAction={
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              className="rounded-md p-2 text-[#555B6B] transition hover:bg-slate-100 hover:text-[#20232D]"
              disabled={isSubmitting}
            >
              {showPassword ? (
                <Eye aria-hidden="true" className="h-[18px] w-[18px]" />
              ) : (
                <EyeOff aria-hidden="true" className="h-[18px] w-[18px]" />
              )}
            </button>
          }
        />

        <LoginErrorMessage message={authError} />

        <Button
          type="submit"
          loading={isSubmitting}
          disabled={!isValid || isSubmitting}
          className={authError ? "!mt-6 h-11 w-full" : "!mt-[26px] h-11 w-full"}
        >
          {isSubmitting ? "Memproses..." : "Masuk ke Dashboard"}
        </Button>
      </form>
    </AuthCard>
  );
}
