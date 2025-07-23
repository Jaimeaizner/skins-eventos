import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-purple-900 via-blue-900 to-pink-900 bg-opacity-80 backdrop-blur-md border-t border-white/10 py-6 mt-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6 text-sm text-white/80">
          <Link to="/termos-de-uso" className="hover:text-white transition">Termos de Uso</Link>
          <Link to="/privacidade" className="hover:text-white transition">Política de Privacidade</Link>
          <Link to="/suporte" className="hover:text-white transition">Suporte</Link>
        </div>
        <div className="text-xs text-white/50 text-center md:text-right">
          © {new Date().getFullYear()} Skins Rifas – Todos os direitos reservados.
        </div>
      </div>
      <div className="container mx-auto px-4 mt-2">
        <p className="text-xs text-yellow-300 text-center">
          <strong>Aviso:</strong> Este site não realiza rifas ou sorteios conforme definidos pela legislação brasileira. As ações aqui são eventos promocionais e recreativos com itens virtuais sem valor monetário legal garantido.
        </p>
      </div>
    </footer>
  );
} 