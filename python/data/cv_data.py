"""Single source of truth for portfolio and CV content."""
from dataclasses import dataclass

@dataclass(frozen=True)
class ContactInfo:
    name: str; title: str; email: str; phone: str; github: str; linkedin: str; location: str
@dataclass(frozen=True)
class Experience:
    company: str; role: str; period: str; summary: str; bullets: list[str]
@dataclass(frozen=True)
class Project:
    title: str; description: str
@dataclass(frozen=True)
class Education:
    degree: str; institution: str; period: str; gpa: str; status: str
@dataclass(frozen=True)
class CVData:
    contact: ContactInfo; summary: str; stats: list[str]; experiences: list[Experience]; projects: list[Project]; skills_text: str; education: Education; learning_bullets: list[str]

CV_DATA = CVData(
    contact=ContactInfo('Jaki Towhidul Islam (Rafi)', 'Junior Software Engineer | ASP.NET Core & ERP Systems', 'tirafi29@gmail.com', '+880 1540 400 287', 'github.com/t-rafi', 'linkedin.com/in/t-rafi/', 'Dhaka, Bangladesh'),
    summary='Software Engineer contributing to enterprise ERP software across requirements, ASP.NET Core development, RDLC reporting, IIS deployment, and production support.',
    stats=['30+ RDLC Reports', '20+ ERP Modules', '20+ Developer Team'],
    experiences=[Experience('iTech Velocity', 'Junior Executive, Software Development', 'Dec 2025 - Present', 'Contributing to the Clarra enterprise ERP platform.', ['Developed and maintained 30+ RDLC reports.', 'Built features and REST APIs with ASP.NET Core, C#, EF Core, and SQL Server.', 'Handled IIS deployment and production troubleshooting.']), Experience('Pinovation Tech Ltd', 'Web Development Intern', 'Jun 2025 - Dec 2025', 'Built responsive interfaces in a professional team environment.', ['Developed with HTML, CSS, Bootstrap, and JavaScript.', 'Worked with Git and GitHub.'])],
    projects=[Project('Clarra ERP Platform', 'Proprietary enterprise ERP platform.'), Project('Registration Form - ASP.NET Core MVC', 'Data-entry application using ASP.NET Core MVC, C#, EF Core, SQL Server, and Razor Views.'), Project('C# Learning Journey', 'Tracked learning repository covering C# fundamentals and OOP.')],
    skills_text='C#, ASP.NET Core, EF Core, SQL Server, RDLC/SSRS, HTML5/CSS3, JavaScript, Razor Views, IIS, Git',
    education=Education('B.Sc. in Computer Science & Engineering', 'Presidency University of Bangladesh', '2026 - Present', '3.9 / 4.0', 'In Progress'),
    learning_bullets=['ASP.NET Core and Microsoft Learn', 'Clean Architecture', 'SQL Server query optimization', 'IIS and production troubleshooting'],
)
