import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          welcome: "Welcome to Smart Farm",
          nav: {
            marketplace: "Marketplace",
            farmer: "Farmer Access",
            advisor: "Advisor Access",
            admin: "Admin",
            login: "Login / Register",
            dashboard: "Dashboard",
            logout: "Logout"
          },
          hero: {
            title: "Fresh from the Farm to Your Table",
            subtitle: "Connect directly with local farmers and get the best quality produce.",
            searchPlaceholder: "Search for products...",
            searchBtn: "Search"
          },
          auth: {
            loginTitle: "Smart Farm Login",
            accessDashboard: "Access your dashboard",
            emailLabel: "Email or Phone",
            emailPlaceholder: "Enter your email or phone",
            passwordLabel: "Password",
            passwordPlaceholder: "Enter your password",
            loginBtn: "Login",
            noAccount: "Don't have an account?",
            registerFarmer: "Register as Farmer",
            backToMarket: "Back to Marketplace",
            invalidCredentials: "Invalid credentials. Please try again."
          }
        }
      },
      fr: {
        translation: {
          welcome: "Bienvenue à Smart Farm",
          nav: {
            marketplace: "Marché",
            farmer: "Accès Fermier",
            advisor: "Accès Conseiller",
            admin: "Admin",
            login: "Connexion / S'inscrire",
            dashboard: "Tableau de bord",
            logout: "Déconnexion"
          },
          hero: {
            title: "De la ferme à votre table",
            subtitle: "Connectez-vous directement avec les agriculteurs locaux et obtenez les meilleurs produits.",
            searchPlaceholder: "Rechercher des produits...",
            searchBtn: "Rechercher"
          },
          auth: {
            loginTitle: "Connexion Smart Farm",
            accessDashboard: "Accédez à votre tableau de bord",
            emailLabel: "Email ou Téléphone",
            emailPlaceholder: "Entrez votre email ou téléphone",
            passwordLabel: "Mot de passe",
            passwordPlaceholder: "Entrez votre mot de passe",
            loginBtn: "Connexion",
            noAccount: "Vous n'avez pas de compte ?",
            registerFarmer: "S'inscrire comme Fermier",
            backToMarket: "Retour au Marché",
            invalidCredentials: "Identifiants invalides. Veuillez réessayer."
          }
        }
      },
      ar: {
        translation: {
          welcome: "مرحبا بكم في المزرعة الذكية",
          nav: {
            marketplace: "السوق",
            farmer: "دخول المزارع",
            advisor: "دخول المستشار",
            admin: "المشرف",
            login: "دخول / تسجيل",
            dashboard: "لوحة القيادة",
            logout: "تسجيل خروج"
          },
          hero: {
            title: "طازجة من المزرعة إلى مائدتك",
            subtitle: "تواصل مباشرة مع المزارعين المحليين واحصل على أفضل المنتجات.",
            searchPlaceholder: "البحث عن المنتجات...",
            searchBtn: "بحث"
          },
          auth: {
            loginTitle: "تسجيل دخول المزرعة الذكية",
            accessDashboard: "الوصول إلى لوحة القيادة الخاصة بك",
            emailLabel: "البريد الإلكتروني أو الهاتف",
            emailPlaceholder: "أدخل بريدك الإلكتروني أو هاتفك",
            passwordLabel: "كلمة المرور",
            passwordPlaceholder: "أدخل كلمة المرور",
            loginBtn: "تسجيل الدخول",
            noAccount: "ليس لديك حساب؟",
            registerFarmer: "سجل كمزارع",
            backToMarket: "العودة إلى السوق",
            invalidCredentials: "بيانات الاعتماد غير صالحة. حاول مرة اخرى."
          }
        }
      }
    }
  });

export default i18n;