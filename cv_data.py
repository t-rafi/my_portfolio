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
    contact=ContactInfo('Towhidul Islam Rafi', 'CSE Student | Software Developer | ERP & .NET', 'tirafi29@gmail.com', '+880 1540 400 287', 'github.com/t-rafi', 'linkedin.com/in/t-rafi/', 'Dhaka, Bangladesh'),
    summary='CSE student and Junior Executive in Software Development at iTech Velocity, working with ASP.NET Core, C#, ERP customization, RDLC reporting, business requirements, and client support.',
    stats=['30+ RDLC Reports', '30+ Responsive Interfaces', 'ERP Business Applications'],
    experiences=[Experience('iTech Velocity', 'Junior Executive, Software Development', 'Dec 14, 2025 - Present', 'Contributing to Clarra ERP through development, reporting, documentation, and client support.', ['Designed and customized 30+ RDLC reports with dynamic data binding and print-ready layouts.', 'Worked on ASP.NET Core and C# ERP customization based on business requirements.', 'Prepared user guidance, investigated issues, and coordinated with technical teams.']), Experience('Pinovation Tech Ltd.', 'Web Development Intern', 'Aug 2025 - Present', 'Built responsive interfaces in a professional software environment.', ['Built 30+ responsive interfaces with HTML, CSS, Bootstrap, and JavaScript.', 'Worked with Git and GitHub.'])],
    projects=[Project('Clarra ERP Platform', 'Proprietary enterprise ERP platform.'), Project('Registration Form - ASP.NET Core MVC', 'Data-entry application using ASP.NET Core MVC, C#, EF Core, SQL Server, and Razor Views.'), Project('C# Learning Journey', 'Tracked learning repository covering C# fundamentals and OOP.')],
    skills_text='C, C++, C#, JavaScript, ASP.NET Core, .NET 8, MVC, Razor Pages, EF Core, REST APIs, SQL Server, RDLC, HTML5/CSS3, Bootstrap, Git, GitHub, IIS, Postman',
    education=Education('B.Sc. in Computer Science & Engineering', 'Presidency University of Bangladesh', 'Expected graduation: 2029', '', 'In Progress'),
    learning_bullets=['DevSkill ASP.NET Core course - Ongoing', '.NET and ERP business application learning', 'SQL, Git/GitHub, IIS deployment, and RDLC reporting'],
)
