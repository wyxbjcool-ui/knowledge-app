import { useState, useCallback } from 'react';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Study from './pages/Study';
import FillBlankPage from './pages/FillBlank';
import ChoicePage from './pages/Choice';
import WrongBook from './pages/WrongBook';
import Favorites from './pages/Favorites';
import CategoryStudy from './pages/CategoryStudy';
import Search from './pages/Search';
import Settings from './pages/Settings';

type Page =
  | 'home'
  | 'study'
  | 'studyByCategory'
  | 'randomStudy'
  | 'wrongStudy'
  | 'favorites'
  | 'categoryStudy'
  | 'fillBlank'
  | 'choice'
  | 'library'
  | 'wrong'
  | 'settings';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [studyCategory, setStudyCategory] = useState('');

  const handleNavigate = useCallback((p: string) => {
    if (p === 'study') {
      setPage('study');
    } else if (p === 'studyByCategory') {
      setPage('studyByCategory');
    } else if (p === 'randomStudy') {
      setPage('randomStudy');
    } else if (p === 'wrongStudy') {
      setPage('wrongStudy');
    } else if (p === 'favorites') {
      setPage('favorites');
    } else if (p === 'categoryStudy') {
      setPage('categoryStudy');
    } else if (p === 'fillBlank') {
      setPage('fillBlank');
    } else if (p === 'choice') {
      setPage('choice');
    } else if (p === 'library') {
      setPage('library');
    } else if (p === 'wrong') {
      setPage('wrong');
    } else if (p === 'settings') {
      setPage('settings');
    } else {
      setPage('home');
    }
  }, []);

  const handleSelectCategory = useCallback((cat: string) => {
    setStudyCategory(cat);
  }, []);

  const handleDone = useCallback(() => {
    setPage('home');
  }, []);

  // Map page state to nav tab
  const navActive = (() => {
    switch (page) {
      case 'home':
        return 'home';
      case 'study':
      case 'studyByCategory':
      case 'randomStudy':
      case 'wrongStudy':
      case 'fillBlank':
      case 'choice':
      case 'favorites':
      case 'categoryStudy':
        return 'study';
      case 'library':
        return 'library';
      case 'wrong':
        return 'wrong';
      case 'settings':
        return 'settings';
      default:
        return 'home';
    }
  })();

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'study':
      case 'studyByCategory':
        return (
          <Study
            mode="daily"
            category={page === 'studyByCategory' ? studyCategory : undefined}
            onDone={handleDone}
          />
        );
      case 'randomStudy':
        return <Study mode="random" onDone={handleDone} />;
      case 'wrongStudy':
        return <Study mode="wrong" onDone={handleDone} />;
      case 'fillBlank':
        return <FillBlankPage onBack={handleDone} />;
      case 'choice':
        return <ChoicePage onBack={handleDone} />;
      case 'favorites':
        return <Favorites />;
      case 'categoryStudy':
        return (
          <CategoryStudy
            onNavigate={handleNavigate}
            onSelectCategory={handleSelectCategory}
          />
        );
      case 'library':
        return <Search />;
      case 'wrong':
        return <WrongBook />;
      case 'settings':
        return <Settings />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  const showBottomNav = !['fillBlank', 'choice'].includes(page);
  const fullHeightPages = ['study', 'studyByCategory', 'randomStudy', 'wrongStudy', 'fillBlank', 'choice'];
  const isFullHeight = fullHeightPages.includes(page);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="flex items-center justify-center h-12 px-4">
          <h1 className="text-base font-semibold text-gray-900 dark:text-white">
            {page === 'fillBlank' ? '填空题模式' :
             page === 'choice' ? '选择题模式' :
             page === 'library' ? '题库搜索' :
             page === 'wrong' ? '错题本' :
             page === 'settings' ? '设置' :
             page === 'favorites' ? '我的收藏' :
             page === 'categoryStudy' ? '分类学习' :
             page === 'randomStudy' ? '随机复习' :
             page === 'wrongStudy' ? '错题重练' :
             page === 'studyByCategory' ? studyCategory :
             '知识点背诵'}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 ${isFullHeight ? 'overflow-hidden' : ''}`} style={{ paddingBottom: (!isFullHeight && showBottomNav) ? '64px' : '0' }}>
        {renderPage()}
      </main>

      {/* Bottom Navigation */}
      {showBottomNav && (
        <BottomNav active={navActive} onNavigate={handleNavigate} />
      )}
    </div>
  );
}
